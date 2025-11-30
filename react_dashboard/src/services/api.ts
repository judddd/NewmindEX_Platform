import axios from 'axios';

// In development, we point to port 80. In production, relative path.
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:80' : '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface ServiceInfo {
  status: 'running' | 'stopped' | 'partial' | 'unknown';
  health?: any;
  url?: string;
  port?: number;
  api_url?: string;
  console_url?: string;
  [key: string]: any;
}

export interface MCPInstance {
  id: string;
  name: string;
  type: string;
  config: any;
  port: number;
  status: string;
  is_healthy?: boolean;
  endpoint?: string;
  health_endpoint?: string;
}

export interface GlobalStatus {
  elasticsearch: ServiceInfo;
  kibana: ServiceInfo;
  lmstudio: ServiceInfo;
  newchat: ServiceInfo;
  newrag: ServiceInfo;
  newflow: ServiceInfo;
  minio: ServiceInfo;
  mcp_servers: {
    total: number;
    running: number;
    instances: MCPInstance[];
  };
}

export interface MCPInstanceCreate {
  name: string;
  type: string;
  config: any;
  port?: number;
}

export interface LogEntry {
  logs: string[];
  count: number;
}

// API Methods
export const DashboardAPI = {
  getStatus: async () => {
    const response = await api.get<GlobalStatus>('/api/status');
    return response.data;
  },

  // Docker Services
  toggleDockerService: async (service: string) => {
    const response = await api.post(`/api/docker/${service}/toggle`);
    return response.data;
  },

  // NewFlow
  toggleNewFlow: async () => {
    const response = await api.post('/api/newflow/toggle');
    return response.data;
  },

  // NewRAG
  toggleNewRAG: async () => {
    const response = await api.post('/api/newrag/toggle');
    return response.data;
  },

  // LM Studio
  toggleLMStudio: async (action: 'start' | 'stop', modelName?: string, port: number = 1234) => {
    if (action === 'start') {
      if (!modelName) throw new Error('Model name required to start');
      const response = await api.post('/api/lmstudio/start', { model_name: modelName, port });
      return response.data;
    } else {
      const response = await api.post('/api/lmstudio/stop');
      return response.data;
    }
  },
  
  openApp: async (appName: 'lmstudio' | 'newchat' | 'minio') => {
    if (appName === 'minio') {
        return (await api.post('/api/minio/open-console')).data;
    }
    return (await api.post(`/api/open-${appName}`)).data;
  },

  // MCP Management
  getMCPInstances: async () => {
    const response = await api.get<MCPInstance[]>('/api/mcp/instances');
    return response.data;
  },
  
  createMCPInstance: async (data: MCPInstanceCreate) => {
    const response = await api.post<MCPInstance>('/api/mcp/instances', data);
    return response.data;
  },

  deleteMCPInstance: async (id: string) => {
    const response = await api.delete(`/api/mcp/instances/${id}`);
    return response.data;
  },

  toggleMCPInstance: async (id: string, action: 'start' | 'stop') => {
    const response = await api.post(`/api/mcp/instances/${id}/${action}`);
    return response.data;
  },

  getMCPTemplates: async () => {
    const response = await api.get('/api/mcp/templates');
    return response.data;
  },

  // Logs
  getLogs: async (type: 'operations' | 'mcp-calls' | 'audit' | 'dashboard', lines: number = 100) => {
    const response = await api.get<LogEntry>(`/api/logs/${type}?lines=${lines}`);
    return response.data;
  }
};

export default api;

