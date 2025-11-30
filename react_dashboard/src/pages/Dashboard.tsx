import { useEffect, useState } from 'react';
import { DashboardAPI } from '../services/api';
import type { GlobalStatus } from '../services/api';
import { Button, StatusIndicator } from '../components/ui/common';
import { ExternalLink, RefreshCw, Play, Square, Activity, Box, Zap, Cpu, Server } from 'lucide-react';
import { cn } from '../lib/utils';

export const Dashboard = () => {
  const [status, setStatus] = useState<GlobalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await DashboardAPI.getStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDockerToggle = async (service: string) => {
    setActionLoading(service);
    try {
      await DashboardAPI.toggleDockerService(service);
      await fetchStatus();
    } finally {
      setActionLoading(null);
    }
  };

  const handleNewFlowToggle = async () => {
    setActionLoading('newflow');
    try {
      await DashboardAPI.toggleNewFlow();
      await fetchStatus();
    } finally {
      setActionLoading(null);
    }
  };

  const handleNewRAGToggle = async () => {
    setActionLoading('newrag');
    try {
      await DashboardAPI.toggleNewRAG();
      await fetchStatus();
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleOpenApp = async (app: 'lmstudio' | 'newchat' | 'minio') => {
    await DashboardAPI.openApp(app);
  };

  if (loading && !status) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                <RefreshCw className="animate-spin w-12 h-12 text-blue-500 relative z-10" />
            </div>
            <p className="mt-4 text-slate-400 font-medium animate-pulse">正在初始化系统...</p>
        </div>
    );
  }

  if (!status) return <div className="text-center text-red-500 p-10">加载系统状态失败</div>;

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative">
        {/* Background Glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">
            系统 <span className="gradient-text">概览</span>
          </h2>
          <p className="text-slate-400 max-w-2xl text-lg">
            Apple Mac Studio 企业级 AI 一体机 · 智能分析与自动化管理平台
          </p>
        </div>
        
        <Button 
            variant="outline" 
            onClick={fetchStatus} 
            isLoading={loading && !!status}
            className="border-blue-500/30 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)]"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && !!status && "animate-spin")} />
          刷新状态
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            label="服务总数" 
            value="8" 
            icon={Box} 
            color="blue"
        />
        <StatCard 
            label="运行中服务" 
            value={Object.values(status).filter((s: any) => s?.status === 'running').length.toString()} 
            icon={Activity} 
            color="emerald"
        />
        <StatCard 
            label="MCP 服务" 
            value={status.mcp_servers.total.toString()} 
            icon={Server} 
            color="purple"
        />
        <StatCard 
            label="系统负载" 
            value="正常" 
            icon={Cpu} 
            color="cyan"
        />
      </div>

      <div className="grid gap-8">
        
        {/* AI Services (Now First) */}
        <Section title="AI 服务与应用" icon={Cpu}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* NewFlow */}
                <ServiceCard
                title="NewFlow"
                description="可视化工作流自动化工具"
                status={status.newflow.status}
                loading={actionLoading === 'newflow'}
                onToggle={handleNewFlowToggle}
                link={status.newflow.url}
                >
                    {status.newflow.status === 'running' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            端口: {status.newflow.port || 5678}
                        </div>
                    )}
                </ServiceCard>

                    {/* NewRAG */}
                    <ServiceCard
                    title="NewRAG"
                    description="检索增强生成 (RAG) 平台"
                    status={status.newrag.status}
                    loading={actionLoading === 'newrag'}
                    onToggle={handleNewRAGToggle}
                    link={status.newrag.url}
                    >
                            {status.newrag.status === 'running' && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800 w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    端口: 3000
                                </div>
                            )}
                    </ServiceCard>

                {/* LM Studio */}
                <ServiceCard
                title="LM Studio"
                description="本地大语言模型服务"
                status={status.lmstudio.status}
                loading={actionLoading === 'lmstudio'}
                onToggle={undefined}
                >
                <Button size="sm" variant="outline" className="w-full mt-4 border-slate-700 hover:bg-slate-800 text-slate-300" onClick={() => handleOpenApp('lmstudio')}>
                    启动应用 <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
                {status.lmstudio.status === 'running' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        端口: {status.lmstudio.port}
                    </div>
                )}
                </ServiceCard>

                {/* NewChat */}
                <ServiceCard
                title="NewChat"
                description="现代 AI 对话界面"
                status={status.newchat.status}
                loading={false}
                onToggle={undefined}
                >
                <Button size="sm" variant="outline" className="w-full mt-4 border-slate-700 hover:bg-slate-800 text-slate-300" onClick={() => handleOpenApp('newchat')}>
                    启动应用 <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
                </ServiceCard>
            </div>
        </Section>

         {/* Core Infrastructure (Now Second) */}
         <Section title="核心基础设施" icon={Zap}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Elasticsearch */}
                <ServiceCard
                title="Elasticsearch"
                description="分布式搜索和分析引擎"
                status={status.elasticsearch.status}
                loading={actionLoading === 'elasticsearch'}
                onToggle={() => handleDockerToggle('elasticsearch')}
                >
                <div className="flex flex-wrap gap-2 mt-3">
                    <div className="flex items-center gap-2 text-xs px-3 py-1.5 bg-slate-900/50 rounded-md border border-slate-800/50 w-fit">
                        <span className="text-slate-500">健康状态:</span>
                        <span className={cn("font-bold uppercase", status.elasticsearch.health?.status === 'green' ? 'text-emerald-500' : 'text-yellow-500')}>
                            {status.elasticsearch.health?.status || '未知'}
                        </span>
                    </div>
                    {status.elasticsearch.status === 'running' && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            端口: 9200
                        </div>
                    )}
                </div>
                </ServiceCard>

                {/* Kibana */}
                <ServiceCard
                title="Kibana"
                description="Elasticsearch 数据可视化仪表盘"
                status={status.kibana.status}
                loading={actionLoading === 'kibana'}
                onToggle={() => handleDockerToggle('kibana')}
                link={status.kibana.url}
                >
                    {status.kibana.status === 'running' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            端口: 5601
                        </div>
                    )}
                </ServiceCard>

                {/* MinIO */}
                <ServiceCard
                title="MinIO"
                description="高性能对象存储服务"
                status={status.minio.status}
                loading={actionLoading === 'minio'}
                onToggle={() => handleDockerToggle('minio')}
                >
                    <div className="mt-4">
                        <Button size="sm" variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300" onClick={() => handleOpenApp('minio')}>
                            打开控制台 <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                    </div>
                    {status.minio.status === 'running' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            端口: 9000 / 9001
                        </div>
                    )}
                </ServiceCard>
            </div>
        </Section>

        {/* MCP Summary */}
        <div className="cyber-card p-1">
            <div className="bg-[#151b2e] p-6 rounded-[14px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Server className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">MCP 服务实例</h3>
                            <p className="text-sm text-slate-400">管理模型上下文协议 (MCP) 服务</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">{status.mcp_servers.total}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">总数</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-400">{status.mcp_servers.running}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">运行中</div>
                        </div>
                        <Button 
                            onClick={() => window.location.href = '/mcp'}
                            className="bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] border-none"
                        >
                            管理服务
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-800/60">
            <Icon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-slate-200">{title}</h3>
        </div>
        {children}
    </div>
);

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => {
    const colorClasses = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    }[color] || "text-blue-400 bg-blue-500/10 border-blue-500/20";

    return (
        <div className="cyber-card p-5 flex items-center justify-between group">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
                <div className="text-2xl font-black text-white group-hover:scale-105 transition-transform">{value}</div>
            </div>
            <div className={cn("p-3 rounded-xl border transition-all duration-300", colorClasses)}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}

const ServiceCard = ({ 
  title, 
  description, 
  status, 
  loading, 
  onToggle, 
  link,
  children 
}: { 
  title: string; 
  description: string; 
  status: string; 
  loading: boolean; 
  onToggle?: () => void; 
  link?: string;
  children?: React.ReactNode;
}) => {
  const isRunning = status === 'running';
  
  return (
    <div className="cyber-card flex flex-col h-full">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className={cn("w-2 h-8 rounded-full", isRunning ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-700")}></div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                </div>
            </div>
            <StatusIndicator status={status} />
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">{description}</p>
        {children}
      </div>

      <div className="p-4 bg-slate-900/40 border-t border-slate-800/60 flex gap-3">
        {onToggle && (
            <Button 
                variant={isRunning ? "destructive" : "default"} 
                size="sm" 
                className={cn(
                    "flex-1 font-bold tracking-wide transition-all duration-300",
                    isRunning 
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/50" 
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border-none"
                )}
                onClick={onToggle}
                isLoading={loading}
            >
                {isRunning ? (
                    <>
                        <Square className="w-3 h-3 mr-2 fill-current" /> 停止
                    </>
                ) : (
                    <>
                        <Play className="w-3 h-3 mr-2 fill-current" /> 启动
                    </>
                )}
            </Button>
        )}
        {link && isRunning && (
            <Button 
                variant="secondary" 
                size="sm" 
                className="flex-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20" 
                onClick={() => window.open(link, '_blank')}
            >
                访问 <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
        )}
      </div>
    </div>
  );
};
