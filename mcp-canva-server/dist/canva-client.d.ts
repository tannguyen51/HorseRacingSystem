import { TokenStore } from './auth.js';
export interface CanvaDesign {
    id: string;
    title: string;
    design_type: string;
    urls: Record<string, string>;
    created_at: string;
    updated_at: string;
    owner: {
        id: string;
        display_name: string;
    };
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
export declare class CanvaClient {
    private tokenStore;
    private client;
    constructor(tokenStore: TokenStore);
    createDesign(params: {
        design_type: string;
        title?: string;
        width?: number;
        height?: number;
    }): Promise<CanvaDesign>;
    getDesign(designId: string): Promise<CanvaDesign>;
    listDesigns(params?: {
        limit?: number;
        continuation?: string;
    }): Promise<{
        designs: CanvaDesign[];
        continuation?: string;
    }>;
    addPage(designId: string): Promise<CanvaPage>;
    addTextElement(designId: string, pageId: string, params: {
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
    }): Promise<CanvaElement>;
    addShapeElement(designId: string, pageId: string, params: {
        shape_type: 'rectangle' | 'circle' | 'line' | 'triangle';
        top?: number;
        left?: number;
        width?: number;
        height?: number;
        color?: string;
        fill_color?: string;
    }): Promise<CanvaElement>;
    uploadAsset(params: {
        name: string;
        file_url: string;
    }): Promise<UploadedAsset>;
    addImageElement(designId: string, pageId: string, params: {
        asset_id: string;
        top?: number;
        left?: number;
        width?: number;
        height?: number;
    }): Promise<CanvaElement>;
    exportDesign(designId: string, format?: 'pdf' | 'png' | 'jpg'): Promise<ExportJob>;
    getExportStatus(designId: string, exportId: string): Promise<ExportJob>;
    deleteDesign(designId: string): Promise<void>;
}
//# sourceMappingURL=canva-client.d.ts.map