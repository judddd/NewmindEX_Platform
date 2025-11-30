import React, { useEffect, useState } from 'react';
import { DashboardAPI } from '../services/api';
import type { MCPInstance } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, StatusIndicator } from '../components/ui/common';
import { Play, Square, Trash2, Plus, X, Copy, Settings, Upload, File as FileIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export const MCPManager = () => {
  const [instances, setInstances] = useState<MCPInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [exportConfig, setExportConfig] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [certInstance, setCertInstance] = useState<MCPInstance | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchInstances = async () => {
    try {
      const data = await DashboardAPI.getMCPInstances();
      setInstances(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
      try {
          const data = await DashboardAPI.getMCPTemplates();
          const templatesList = Array.isArray(data) 
            ? data 
            : Object.entries(data).map(([key, value]: [string, any]) => ({
                id: key,
                ...value
            }));
          setTemplates(templatesList);
      } catch(e) {
          console.error(e);
      }
  }

  useEffect(() => {
    fetchInstances();
    fetchTemplates();
    const interval = setInterval(fetchInstances, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (id: string, currentStatus: string) => {
    const action = currentStatus === 'running' ? 'stop' : 'start';
    await DashboardAPI.toggleMCPInstance(id, action);
    fetchInstances();
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除此实例吗？')) {
      await DashboardAPI.deleteMCPInstance(id);
      fetchInstances();
    }
  };

  const handleCopy = (instance: MCPInstance) => {
      let key = instance.id;
      if (/^[a-zA-Z0-9\s\-_]+$/.test(instance.name)) {
          key = instance.name.toLowerCase().replace(/\s+/g, '_');
      }

      const config = {
          "mcpServers": {
              [key]: { 
                  "transport": "streamable",
                  "enabled": true,
                  "url": `http://localhost:${instance.port}/mcp`,
                  "env": instance.config
              }
          }
      };
      setExportConfig(JSON.stringify(config, null, 2));
      setShowExportModal(true);
  };

  const handleCertManage = (instance: MCPInstance) => {
      setCertInstance(instance);
      setShowCertModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">MCP 服务</h2>
          <p className="text-muted-foreground">管理 Model Context Protocol (MCP) 服务实例。</p>
        </div>
        <Button onClick={() => { setSelectedTemplate(null); setShowCreateModal(true); }}>
            <Plus className="w-4 h-4 mr-2" /> 创建实例
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instances.map((instance) => (
          <Card key={instance.id} className="overflow-hidden">
            <div className={cn("h-2 w-full", instance.is_healthy ? "bg-green-500" : "bg-gray-200")} />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{instance.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{instance.type}</Badge>
                        <span className="text-xs text-muted-foreground">端口: {instance.port}</span>
                    </div>
                </div>
                <StatusIndicator status={instance.is_healthy ? 'running' : 'stopped'} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant={instance.is_healthy ? "destructive" : "default"}
                  className="flex-1"
                  onClick={() => handleToggle(instance.id, instance.is_healthy ? 'running' : 'stopped')}
                >
                  {instance.is_healthy ? (
                      <>
                          <Square className="w-3 h-3 mr-2 fill-current" /> 停止
                      </>
                  ) : (
                      <>
                          <Play className="w-3 h-3 mr-2 fill-current" /> 启动
                      </>
                  )}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleCertManage(instance)} title="证书管理">
                    <Settings className="w-4 h-4 text-slate-400" />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleCopy(instance)} title="复制配置">
                    <Copy className="w-4 h-4 text-slate-400" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(instance.id)} title="删除实例">
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {instances.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl text-muted-foreground">
                <ServerIcon className="w-12 h-12 mb-4 opacity-20" />
                <p>未找到 MCP 实例。创建一个以开始。</p>
            </div>
        )}
      </div>

      {showCreateModal && (
        <CreateMCPModal 
            onClose={() => setShowCreateModal(false)} 
            onCreated={() => { setShowCreateModal(false); fetchInstances(); }}
            templates={templates}
            initialTemplate={selectedTemplate}
        />
      )}

      {showExportModal && (
        <ExportConfigModal 
            config={exportConfig} 
            onClose={() => setShowExportModal(false)} 
        />
      )}

      {showCertModal && certInstance && (
        <CertManagerModal 
            instance={certInstance}
            onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};

const ServerIcon = ({className}: {className?: string}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
)

const CertManagerModal = ({ instance, onClose }: { instance: MCPInstance, onClose: () => void }) => {
    const [files, setFiles] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const fetchFiles = async () => {
        try {
            const data = await DashboardAPI.getMCPCerts(instance.id);
            setFiles(data.certs || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [instance.id]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);
        try {
            await DashboardAPI.uploadMCPCert(instance.id, file);
            await fetchFiles();
            alert('上传成功！请在配置中使用路径: /certs/' + file.name);
        } catch (e) {
            alert('上传失败');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`确定要删除 ${filename} 吗？`)) return;
        try {
            await DashboardAPI.deleteMCPCert(instance.id, filename);
            fetchFiles();
        } catch (e) {
            alert('删除失败');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-xl border shadow-lg w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">证书管理 - {instance.name}</h3>
                    <button onClick={onClose}><X className="w-4 h-4" /></button>
                </div>
                
                <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-900/80 transition-colors relative">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">点击上传 CA 证书文件</p>
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                        {uploading && <p className="text-xs text-blue-400 mt-2">上传中...</p>}
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2">已上传文件</h4>
                        {files.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">暂无上传文件</p>
                        ) : (
                            <div className="space-y-2">
                                {files.map(file => (
                                    <div key={file} className="flex items-center justify-between bg-slate-900 p-3 rounded-md text-sm border border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <FileIcon className="w-4 h-4 text-blue-400" />
                                            <span>{file}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground font-mono bg-slate-950 px-2 py-1 rounded">/certs/{file}</span>
                                            <button onClick={() => handleDelete(file)} className="text-red-400 hover:text-red-300">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-md text-xs text-blue-300">
                        <p>提示：上传后，请在实例配置中将 <code className="font-bold">XX_CA_CERT</code> 设置为 <code className="font-bold">/certs/文件名</code>，然后重启实例。</p>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={onClose}>关闭</Button>
                </div>
            </div>
        </div>
    );
};

const ExportConfigModal = ({ config, onClose }: { config: string, onClose: () => void }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(config);
        alert('已复制到剪贴板');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-xl border shadow-lg w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">MCP 服务配置</h3>
                    <button onClick={onClose}><X className="w-4 h-4" /></button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    使用此配置连接到该 MCP 服务。
                </p>
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-md text-xs overflow-auto max-h-[300px] mb-4 font-mono">
                    {config}
                </pre>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>关闭</Button>
                    <Button onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-2" /> 复制配置
                    </Button>
                </div>
            </div>
        </div>
    );
};

const CreateMCPModal = ({ onClose, onCreated, templates, initialTemplate }: { onClose: () => void; onCreated: () => void; templates: any[], initialTemplate?: any }) => {
    const [name, setName] = useState(initialTemplate?.name || '');
    const [type, setType] = useState(initialTemplate?.type || templates[0]?.id || 'elasticsearch');
    const [port, setPort] = useState('');
    const [configJson, setConfigJson] = useState(initialTemplate?.config ? JSON.stringify(initialTemplate.config, null, 2) : '{}');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!initialTemplate && type) {
            const template = templates.find(t => t.id === type);
            if (template && template.config) {
                setConfigJson(JSON.stringify(template.config, null, 2));
                if (!name) setName(template.name);
            }
        }
    }, [type, templates, initialTemplate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let config = {};
            try {
                config = JSON.parse(configJson);
            } catch (e) {
                alert('配置 JSON 格式错误');
                setLoading(false);
                return;
            }

            await DashboardAPI.createMCPInstance({
                name,
                type,
                config,
                port: port ? parseInt(port) : undefined
            });
            onCreated();
        } catch (error) {
            alert('创建实例失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-xl border shadow-lg w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">{initialTemplate ? '复制/创建 MCP 实例' : '创建 MCP 实例'}</h3>
                    <button onClick={onClose}><X className="w-4 h-4" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">名称</label>
                        <input 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="我的服务器"
                            required 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">类型</label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={type} 
                                onChange={e => setType(e.target.value)}
                                disabled={!!initialTemplate}
                            >
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">端口 (可选)</label>
                            <input 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={port} 
                                onChange={e => setPort(e.target.value)} 
                                type="number"
                                placeholder="留空自动分配"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">配置 (JSON)</label>
                        <textarea 
                            className="flex min-h-[200px] w-full rounded-md border border-input bg-slate-950 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={configJson}
                            onChange={e => setConfigJson(e.target.value)}
                            placeholder="{}"
                        />
                        <p className="text-xs text-muted-foreground">请根据所选类型修改配置参数。支持多个同类型实例使用不同配置。</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>取消</Button>
                        <Button type="submit" isLoading={loading}>创建</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
