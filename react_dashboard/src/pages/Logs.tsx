import { useEffect, useState, useRef } from 'react';
import { DashboardAPI } from '../services/api';
import { Card, CardContent, CardHeader, Button } from '../components/ui/common';
import { RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export const Logs = () => {
  const [logType, setLogType] = useState<'operations' | 'mcp-calls' | 'audit' | 'dashboard'>('operations');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await DashboardAPI.getLogs(logType, 200);
      setLogs(data.logs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 10s
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [logType]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const tabs = [
    { id: 'operations', label: '操作日志' },
    { id: 'mcp-calls', label: 'MCP 调用' },
    { id: 'audit', label: '审计日志' },
    { id: 'dashboard', label: '系统日志' },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">系统日志</h2>
          <p className="text-muted-foreground">查看各系统组件的运行日志。</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs} isLoading={loading}>
            <RefreshCw className="w-4 h-4 mr-2" /> 刷新
            </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b px-6 py-3 flex-shrink-0">
            <div className="flex gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setLogType(tab.id as any)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            logType === tab.id 
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 bg-[#0a0e1a] text-emerald-400 font-mono text-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
            <div className="h-full overflow-auto p-4 space-y-1 relative z-10" ref={scrollRef}>
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 italic">
                        <div className="w-2 h-2 bg-slate-600 rounded-full animate-ping mb-2"></div>
                        暂无日志记录
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="whitespace-pre-wrap break-all border-b border-emerald-900/20 pb-1 mb-1 last:border-0 hover:bg-emerald-900/10 transition-colors px-2 rounded">
                            <span className="text-slate-500 mr-2 select-none">[{index + 1}]</span>
                            {log}
                        </div>
                    ))
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};
