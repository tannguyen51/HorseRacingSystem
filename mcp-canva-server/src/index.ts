#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod/v4';
import axios from 'axios';

import { CanvaAuth } from './auth.js';
import { CanvaClient } from './canva-client.js';
import type { ExportJob } from './canva-client.js';

// ---- Zod schemas (v4) ----

const PositionSchema = z.object({
  top: z.number().min(0).max(1).optional().describe('Top position (0.0-1.0 fraction of page height)'),
  left: z.number().min(0).max(1).optional().describe('Left position (0.0-1.0 fraction of page width)'),
  width: z.number().min(0).max(1).optional().describe('Element width (0.0-1.0 fraction of page width)'),
  height: z.number().min(0).max(1).optional().describe('Element height (0.0-1.0 fraction of page height)'),
});

// Tool: canva_auth_status
const AuthStatusInputSchema = z.object({});

// Tool: canva_create_design
const CreateDesignInputSchema = z.object({
  title: z.string().optional().describe('Title of the design/presentation'),
  design_type: z
    .enum(['presentation', 'document', 'whiteboard', 'social', 'video'])
    .default('presentation')
    .describe('Type of Canva design to create'),
  width: z.number().positive().optional().describe('Custom width in pixels'),
  height: z.number().positive().optional().describe('Custom height in pixels'),
});

// Tool: canva_add_page
const AddPageInputSchema = z.object({
  design_id: z.string().describe('The design ID to add a page/slide to'),
});

// Tool: canva_add_text
const AddTextInputSchema = z.object({
  design_id: z.string().describe('Design ID'),
  page_id: z.string().describe('Page/slide ID'),
  text: z.string().describe('Text content to add'),
  font_size: z.number().positive().optional().describe('Font size in points'),
  color: z.string().optional().describe('Text color in hex format (#RRGGBB)'),
  font_family: z.string().optional().describe('Font family name'),
  alignment: z.enum(['left', 'center', 'right']).optional().describe('Text alignment'),
  bold: z.boolean().optional().describe('Make text bold'),
  italic: z.boolean().optional().describe('Make text italic'),
}).merge(PositionSchema);

// Tool: canva_add_shape
const AddShapeInputSchema = z.object({
  design_id: z.string().describe('Design ID'),
  page_id: z.string().describe('Page/slide ID'),
  shape_type: z
    .enum(['rectangle', 'circle', 'line', 'triangle'])
    .describe('Type of shape to add'),
  color: z.string().optional().describe('Border/stroke color (hex)'),
  fill_color: z.string().optional().describe('Fill color (hex)'),
}).merge(PositionSchema);

// Tool: canva_upload_asset
const UploadAssetInputSchema = z.object({
  name: z.string().describe('Name for the uploaded asset'),
  file_url: z.string().url().describe('URL of the image to upload'),
});

// Tool: canva_add_image
const AddImageInputSchema = z.object({
  design_id: z.string().describe('Design ID'),
  page_id: z.string().describe('Page/slide ID'),
  asset_id: z.string().describe('Asset ID from canva_upload_asset'),
}).merge(PositionSchema);

// Tool: canva_export_design
const ExportDesignInputSchema = z.object({
  design_id: z.string().describe('Design ID to export'),
  format: z
    .enum(['pdf', 'png', 'jpg'])
    .default('pdf')
    .describe('Export format'),
});

// Tool: canva_get_design
const GetDesignInputSchema = z.object({
  design_id: z.string().describe('Design ID to retrieve'),
});

// Tool: canva_list_designs
const ListDesignsInputSchema = z.object({
  limit: z.number().int().min(1).max(50).optional().describe('Max designs to return'),
});

// Tool: canva_authenticate
const AuthenticateInputSchema = z.object({
  code: z.string().describe('The authorization code from the OAuth callback URL'),
  code_verifier: z.string().describe('The PKCE code verifier (returned by canva_auth_status)'),
});

// ---- Helpers ----

function formatResult(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

async function pollExport(
  client: CanvaClient,
  designId: string,
  exportJob: ExportJob,
  maxAttempts = 30
): Promise<ExportJob> {
  let job = exportJob;
  for (let i = 0; i < maxAttempts; i++) {
    if (job.status === 'success' || job.status === 'failed') {
      return job;
    }
    await new Promise((r) => setTimeout(r, 2000));
    job = await client.getExportStatus(designId, job.id);
  }
  return job;
}

// ---- Server ----

async function main() {
  const auth = new CanvaAuth();

  if (!auth.isConfigured()) {
    console.error(
      'ERROR: CANVA_CLIENT_ID and CANVA_CLIENT_SECRET must be set as environment variables.\n' +
        'Get them from https://www.canva.com/developers/ after creating an app.\n' +
        'Also set CANVA_REDIRECT_URI (default: http://localhost:9876/callback).'
    );
    process.exit(1);
  }

  const client = new CanvaClient(auth.createTokenStore());

  const server = new McpServer(
    { name: 'canva-mcp-server', version: '1.0.0' },
    {
      capabilities: { tools: {} },
      instructions:
        'Canva MCP Server — create and manage Canva presentations, documents, and designs.\n' +
        'First, authenticate with canva_auth_status to get an OAuth URL, open it in a browser,\n' +
        'then call canva_authenticate with the authorization code to complete setup.',
    }
  );

  // --- Register tools ---

  // 1. Auth status
  server.registerTool(
    'canva_auth_status',
    {
      title: 'Canva Auth Status',
      description:
        'Check Canva authentication status. If not authenticated, returns the OAuth authorization URL to open in a browser.',
      inputSchema: AuthStatusInputSchema,
    },
    async () => {
      if (auth.isAuthenticated()) {
        return {
          content: [
            {
              type: 'text' as const,
              text: '✅ Authenticated with Canva. You can now use all Canva tools to create presentations and designs.',
            },
          ],
        };
      }

      const { url, codeVerifier, state } = auth.getAuthUrl();
      return {
        content: [
          {
            type: 'text' as const,
            text: [
              '❌ Not authenticated with Canva. Follow these steps:',
              '',
              `1. Open this URL in your browser:\n   ${url}`,
              '',
              '2. Authorize the application in Canva',
              '',
              '3. After authorization, you will be redirected. Copy the "code" parameter from the redirect URL.',
              '',
              '4. Call canva_authenticate with:',
              `   - code: the authorization code from the redirect`,
              `   - code_verifier: ${codeVerifier}`,
              '',
              `State parameter: ${state}`,
            ].join('\n'),
          },
        ],
      };
    }
  );

  // 2. Authenticate (exchange code for token)
  server.registerTool(
    'canva_authenticate',
    {
      title: 'Authenticate with Canva',
      description:
        'Complete OAuth authentication by exchanging the authorization code for an access token. Get the code from the redirect URL after authorizing in the browser.',
      inputSchema: AuthenticateInputSchema,
    },
    async ({ code, code_verifier }) => {
      try {
        await auth.setTokenFromCode(code, code_verifier);
        return {
          content: [
            {
              type: 'text' as const,
              text: '✅ Successfully authenticated with Canva! You can now create designs and presentations.',
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text' as const,
              text: `❌ Authentication failed: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 3. Create design
  server.registerTool(
    'canva_create_design',
    {
      title: 'Create Canva Design',
      description:
        'Create a new Canva design (presentation, document, whiteboard, etc.). Returns the design ID for subsequent operations.',
      inputSchema: CreateDesignInputSchema,
    },
    async (params) => {
      try {
        const design = await client.createDesign(params);
        return {
          content: [
            {
              type: 'text' as const,
              text: formatResult({
                message: `Created ${params.design_type}: "${design.title}"`,
                design_id: design.id,
                title: design.title,
                design_type: design.design_type,
                urls: design.urls,
                pages: design.pages?.map((p) => ({ id: p.id, index: p.index })),
              }),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const detail =
          axios.isAxiosError(error) && error.response?.data
            ? formatResult(error.response.data)
            : '';
        return {
          content: [
            { type: 'text' as const, text: `❌ Failed: ${message}${detail ? '\n' + detail : ''}` },
          ],
          isError: true,
        };
      }
    }
  );

  // 4. Add page
  server.registerTool(
    'canva_add_page',
    {
      title: 'Add Slide/Page',
      description: 'Add a new slide/page to an existing Canva presentation.',
      inputSchema: AddPageInputSchema,
    },
    async ({ design_id }) => {
      try {
        const page = await client.addPage(design_id);
        return {
          content: [
            {
              type: 'text' as const,
              text: formatResult({
                message: 'Page/slide added successfully',
                page_id: page.id,
                index: page.index,
                design_id,
              }),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `❌ Failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // 5. Add text
  server.registerTool(
    'canva_add_text',
    {
      title: 'Add Text Element',
      description:
        'Add a text element to a page/slide. Position values are fractions (0.0-1.0) relative to page dimensions.',
      inputSchema: AddTextInputSchema,
    },
    async (params) => {
      try {
        const { design_id, page_id, ...elementParams } = params;
        const element = await client.addTextElement(design_id, page_id, elementParams);
        return {
          content: [
            {
              type: 'text' as const,
              text: formatResult({
                message: `Added text: "${params.text.substring(0, 100)}"`,
                element_id: element.id,
                design_id,
                page_id,
              }),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `❌ Failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // 6. Add shape
  server.registerTool(
    'canva_add_shape',
    {
      title: 'Add Shape Element',
      description:
        'Add a shape (rectangle, circle, line, triangle) to a page/slide.',
      inputSchema: AddShapeInputSchema,
    },
    async (params) => {
      try {
        const { design_id, page_id, ...shapeParams } = params;
        const element = await client.addShapeElement(design_id, page_id, shapeParams);
        return {
          content: [
            {
              type: 'text' as const,
              text: formatResult({
                message: `Added ${params.shape_type} shape`,
                element_id: element.id,
                design_id,
                page_id,
              }),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `❌ Failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // 7. Upload asset
  server.registerTool(
    'canva_upload_asset',
    {
      title: 'Upload Image Asset',
      description:
        'Upload an image (from a URL) to Canva for use in designs. Returns an asset_id for use with canva_add_image.',
      inputSchema: UploadAssetInputSchema,
    },
    async (params) => {
      try {
        const asset = await client.uploadAsset(params);
        return {
          content: [
            {
              type: 'text' as const,
              text: formatResult({
                message: `Uploaded asset: "${asset.name}"`,
                asset_id: asset.id,
                mime_type: asset.mime_type,
                thumbnail_url: asset.thumbnail_url,
              }),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `❌ Failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // 8. Add image
  server.registerTool(
    'canva_add_image',
    {
      title: 'Add Image Element',
      description: 'Place an uploaded image onto a page/slide.',
      inputSchema: AddImageInputSchema,
    },
    async (params) => {
      try {
        const { design_id, page_id, ...imageParams } = params;
        const element = await client.addImageElement(design_id, page_id, imageParams);
        return {
          content: [
            {
              type: 'text' as const,
              text: formatResult({
                message: 'Image placed on page',
                element_id: element.id,
                design_id,
                page_id,
              }),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `❌ Failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // 9. Export design
  server.registerTool(
    'canva_export_design',
    {
      title: 'Export Design',
      description:
        'Export a Canva design to PDF, PNG, or JPG. Waits for the export to complete and returns download URLs.',
      inputSchema: ExportDesignInputSchema,
    },
    async ({ design_id, format }) => {
      try {
        const exportJob = await client.exportDesign(design_id, format);
        const result = await pollExport(client, design_id, exportJob);

        if (result.status === 'failed') {
          return {
            content: [
              {
                type: 'text' as const,
                text: `❌ Export failed: ${result.error || 'Unknown error'}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: formatResult({
                message: `Export complete (${format.toUpperCase()})`,
                design_id,
                export_id: result.id,
                format,
                download_urls: result.urls,
              }),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `❌ Failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // 10. Get design
  server.registerTool(
    'canva_get_design',
    {
      title: 'Get Design Details',
      description:
        'Get full details of a Canva design including all pages and their elements.',
      inputSchema: GetDesignInputSchema,
    },
    async ({ design_id }) => {
      try {
        const design = await client.getDesign(design_id);
        return {
          content: [{ type: 'text' as const, text: formatResult(design) }],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `❌ Failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // 11. List designs
  server.registerTool(
    'canva_list_designs',
    {
      title: 'List Designs',
      description: 'List your Canva designs (most recent first).',
      inputSchema: ListDesignsInputSchema,
    },
    async ({ limit }) => {
      try {
        const result = await client.listDesigns({ limit });
        return {
          content: [
            {
              type: 'text' as const,
              text: formatResult({
                count: result.designs.length,
                designs: result.designs.map((d) => ({
                  id: d.id,
                  title: d.title,
                  type: d.design_type,
                  updated: d.updated_at,
                })),
                has_more: !!result.continuation,
              }),
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `❌ Failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // ---- Connect ----
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
