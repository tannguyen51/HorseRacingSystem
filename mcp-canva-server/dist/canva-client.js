import axios from 'axios';
const CANVA_API_BASE = 'https://api.canva.com/rest/v1';
function createClient(tokenStore) {
    const client = axios.create({
        baseURL: CANVA_API_BASE,
        headers: { 'Content-Type': 'application/json' },
    });
    client.interceptors.request.use(async (config) => {
        const token = await tokenStore.getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
    client.interceptors.response.use((response) => response, async (error) => {
        if (error.response?.status === 401 && tokenStore.refreshAccessToken) {
            try {
                await tokenStore.refreshAccessToken();
                const token = await tokenStore.getAccessToken();
                error.config.headers.Authorization = `Bearer ${token}`;
                return client.request(error.config);
            }
            catch {
                throw error;
            }
        }
        throw error;
    });
    return client;
}
export class CanvaClient {
    tokenStore;
    client;
    constructor(tokenStore) {
        this.tokenStore = tokenStore;
        this.client = createClient(tokenStore);
    }
    async createDesign(params) {
        const body = {
            design_type: params.design_type,
        };
        if (params.title)
            body.title = params.title;
        if (params.width)
            body.width = params.width;
        if (params.height)
            body.height = params.height;
        const { data } = await this.client.post('/designs', body);
        return data.design;
    }
    async getDesign(designId) {
        const { data } = await this.client.get(`/designs/${designId}`);
        return data.design;
    }
    async listDesigns(params) {
        const { data } = await this.client.get('/designs', { params });
        return { designs: data.items, continuation: data.continuation };
    }
    async addPage(designId) {
        const { data } = await this.client.post(`/designs/${designId}/pages`);
        return data.page;
    }
    async addTextElement(designId, pageId, params) {
        const body = {
            type: 'text',
            text: params.text,
        };
        if (params.font_size)
            body.font_size = params.font_size;
        if (params.color)
            body.color = params.color;
        if (params.top !== undefined)
            body.top = params.top;
        if (params.left !== undefined)
            body.left = params.left;
        if (params.width !== undefined)
            body.width = params.width;
        if (params.height !== undefined)
            body.height = params.height;
        if (params.font_family)
            body.font_family = params.font_family;
        if (params.alignment)
            body.alignment = params.alignment;
        if (params.bold !== undefined)
            body.bold = params.bold;
        if (params.italic !== undefined)
            body.italic = params.italic;
        const { data } = await this.client.post(`/designs/${designId}/pages/${pageId}/elements`, body);
        return data.element;
    }
    async addShapeElement(designId, pageId, params) {
        const body = {
            type: 'shape',
            shape: params.shape_type,
        };
        if (params.top !== undefined)
            body.top = params.top;
        if (params.left !== undefined)
            body.left = params.left;
        if (params.width !== undefined)
            body.width = params.width;
        if (params.height !== undefined)
            body.height = params.height;
        if (params.color)
            body.color = params.color;
        if (params.fill_color)
            body.fill_color = params.fill_color;
        const { data } = await this.client.post(`/designs/${designId}/pages/${pageId}/elements`, body);
        return data.element;
    }
    async uploadAsset(params) {
        // Download the file from the URL first, then upload to Canva
        const imageResponse = await axios.get(params.file_url, {
            responseType: 'arraybuffer',
        });
        const buffer = Buffer.from(imageResponse.data);
        const contentType = imageResponse.headers['content-type'] || 'application/octet-stream';
        // Canva asset upload uses multipart form data
        const formData = new FormData();
        formData.append('name', params.name);
        formData.append('file', new Blob([buffer], { type: contentType }));
        const { data } = await this.client.post('/assets/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.asset;
    }
    async addImageElement(designId, pageId, params) {
        const body = {
            type: 'image',
            asset_id: params.asset_id,
        };
        if (params.top !== undefined)
            body.top = params.top;
        if (params.left !== undefined)
            body.left = params.left;
        if (params.width !== undefined)
            body.width = params.width;
        if (params.height !== undefined)
            body.height = params.height;
        const { data } = await this.client.post(`/designs/${designId}/pages/${pageId}/elements`, body);
        return data.element;
    }
    async exportDesign(designId, format = 'pdf') {
        const body = { format };
        if (format === 'pdf')
            body.pages = 'all';
        const { data } = await this.client.post(`/designs/${designId}/exports`, body);
        return data.export_job;
    }
    async getExportStatus(designId, exportId) {
        const { data } = await this.client.get(`/designs/${designId}/exports/${exportId}`);
        return data.export_job;
    }
    async deleteDesign(designId) {
        await this.client.delete(`/designs/${designId}`);
    }
}
//# sourceMappingURL=canva-client.js.map