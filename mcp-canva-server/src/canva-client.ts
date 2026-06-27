import axios, { AxiosInstance } from 'axios';
import { TokenStore } from './auth.js';

const CANVA_API_BASE = 'https://api.canva.com/rest/v1';

export interface CanvaDesign {
  id: string;
  title: string;
  design_type: string;
  urls: Record<string, string>;
  created_at: string;
  updated_at: string;
  owner: { id: string; display_name: string };
  pages?: CanvaPage[];
}

export interface CanvaPage {
  id: string;
  index: number;
  elements?: CanvaElement[];
}

export interface CanvaElement {
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface ExportJob {
  id: string;
  status: 'queued' | 'processing' | 'success' | 'failed';
  urls?: string[];
  error?: string;
}

export interface UploadedAsset {
  id: string;
  name: string;
  mime_type: string;
  thumbnail_url?: string;
}

function createClient(tokenStore: TokenStore): AxiosInstance {
  const client = axios.create({
    baseURL: CANVA_API_BASE,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(async (config) => {
    const token = await tokenStore.getAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && tokenStore.refreshAccessToken) {
        try {
          await tokenStore.refreshAccessToken();
          const token = await tokenStore.getAccessToken();
          error.config.headers.Authorization = `Bearer ${token}`;
          return client.request(error.config);
        } catch {
          throw error;
        }
      }
      throw error;
    }
  );

  return client;
}

export class CanvaClient {
  private client: AxiosInstance;

  constructor(private tokenStore: TokenStore) {
    this.client = createClient(tokenStore);
  }

  async createDesign(params: {
    design_type: string;
    title?: string;
    width?: number;
    height?: number;
  }): Promise<CanvaDesign> {
    const body: Record<string, unknown> = {
      design_type: params.design_type,
    };
    if (params.title) body.title = params.title;
    if (params.width) body.width = params.width;
    if (params.height) body.height = params.height;

    const { data } = await this.client.post('/designs', body);
    return data.design;
  }

  async getDesign(designId: string): Promise<CanvaDesign> {
    const { data } = await this.client.get(`/designs/${designId}`);
    return data.design;
  }

  async listDesigns(params?: {
    limit?: number;
    continuation?: string;
  }): Promise<{ designs: CanvaDesign[]; continuation?: string }> {
    const { data } = await this.client.get('/designs', { params });
    return { designs: data.items, continuation: data.continuation };
  }

  async addPage(designId: string): Promise<CanvaPage> {
    const { data } = await this.client.post(`/designs/${designId}/pages`);
    return data.page;
  }

  async addTextElement(
    designId: string,
    pageId: string,
    params: {
      text: string;
      font_size?: number;
      color?: string;
      top?: number;
      left?: number;
      width?: number;
      height?: number;
      font_family?: string;
      alignment?: 'left' | 'center' | 'right';
      bold?: boolean;
      italic?: boolean;
    }
  ): Promise<CanvaElement> {
    const body: Record<string, unknown> = {
      type: 'text',
      text: params.text,
    };
    if (params.font_size) body.font_size = params.font_size;
    if (params.color) body.color = params.color;
    if (params.top !== undefined) body.top = params.top;
    if (params.left !== undefined) body.left = params.left;
    if (params.width !== undefined) body.width = params.width;
    if (params.height !== undefined) body.height = params.height;
    if (params.font_family) body.font_family = params.font_family;
    if (params.alignment) body.alignment = params.alignment;
    if (params.bold !== undefined) body.bold = params.bold;
    if (params.italic !== undefined) body.italic = params.italic;

    const { data } = await this.client.post(
      `/designs/${designId}/pages/${pageId}/elements`,
      body
    );
    return data.element;
  }

  async addShapeElement(
    designId: string,
    pageId: string,
    params: {
      shape_type: 'rectangle' | 'circle' | 'line' | 'triangle';
      top?: number;
      left?: number;
      width?: number;
      height?: number;
      color?: string;
      fill_color?: string;
    }
  ): Promise<CanvaElement> {
    const body: Record<string, unknown> = {
      type: 'shape',
      shape: params.shape_type,
    };
    if (params.top !== undefined) body.top = params.top;
    if (params.left !== undefined) body.left = params.left;
    if (params.width !== undefined) body.width = params.width;
    if (params.height !== undefined) body.height = params.height;
    if (params.color) body.color = params.color;
    if (params.fill_color) body.fill_color = params.fill_color;

    const { data } = await this.client.post(
      `/designs/${designId}/pages/${pageId}/elements`,
      body
    );
    return data.element;
  }

  async uploadAsset(params: {
    name: string;
    file_url: string;
  }): Promise<UploadedAsset> {
    // Download the file from the URL first, then upload to Canva
    const imageResponse = await axios.get(params.file_url, {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(imageResponse.data);
    const contentType: string =
      (imageResponse.headers['content-type'] as string) || 'application/octet-stream';

    // Canva asset upload uses multipart form data
    const formData = new FormData();
    formData.append('name', params.name);
    formData.append('file', new Blob([buffer], { type: contentType }));

    const { data } = await this.client.post('/assets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.asset;
  }

  async addImageElement(
    designId: string,
    pageId: string,
    params: {
      asset_id: string;
      top?: number;
      left?: number;
      width?: number;
      height?: number;
    }
  ): Promise<CanvaElement> {
    const body: Record<string, unknown> = {
      type: 'image',
      asset_id: params.asset_id,
    };
    if (params.top !== undefined) body.top = params.top;
    if (params.left !== undefined) body.left = params.left;
    if (params.width !== undefined) body.width = params.width;
    if (params.height !== undefined) body.height = params.height;

    const { data } = await this.client.post(
      `/designs/${designId}/pages/${pageId}/elements`,
      body
    );
    return data.element;
  }

  async exportDesign(
    designId: string,
    format: 'pdf' | 'png' | 'jpg' = 'pdf'
  ): Promise<ExportJob> {
    const body: Record<string, unknown> = { format };
    if (format === 'pdf') body.pages = 'all';

    const { data } = await this.client.post(
      `/designs/${designId}/exports`,
      body
    );
    return data.export_job;
  }

  async getExportStatus(
    designId: string,
    exportId: string
  ): Promise<ExportJob> {
    const { data } = await this.client.get(
      `/designs/${designId}/exports/${exportId}`
    );
    return data.export_job;
  }

  async deleteDesign(designId: string): Promise<void> {
    await this.client.delete(`/designs/${designId}`);
  }
}
