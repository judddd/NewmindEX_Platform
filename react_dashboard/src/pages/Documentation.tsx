import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui/common';
import { ExternalLink, Book, FileText, Code, HelpCircle } from 'lucide-react';

export const Documentation = () => {
  const docs = [
    {
      title: 'NewFlow 文档',
      description: 'NewFlow 工作流自动化平台的官方文档，包含节点参考、工作流示例和 API 指南。',
      link: 'http://localhost:8001', 
      icon: Book,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'NewChat 使用指南',
      description: 'NewChat AI 对话界面的用户手册，了解如何管理模型、插件和知识库。',
      link: 'http://localhost:8002',
      icon: HelpCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'MCP 协议规范',
      description: 'Model Context Protocol (MCP) 技术规范文档，适合开发者阅读以开发自定义 MCP 服务。',
      link: 'https://modelcontextprotocol.io',
      icon: Code,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Elastic Stack 指南',
      description: 'Elasticsearch 和 Kibana 的配置与优化指南，帮助您更好地管理数据分析平台。',
      link: 'https://www.elastic.co/guide/index.html',
      icon: FileText,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">文档中心</h2>
          <p className="text-muted-foreground">查阅平台各组件的使用手册和开发文档。</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {docs.map((doc, index) => (
          <Card key={index} className="group hover:border-slate-600 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border ${doc.bg}`}>
                  <doc.icon className={`w-6 h-6 ${doc.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{doc.title}</CardTitle>
                  <p className="text-sm text-slate-400 leading-relaxed">{doc.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                variant="secondary" 
                className="w-full mt-2 group-hover:bg-slate-800 transition-colors"
                onClick={() => window.open(doc.link, '_blank')}
              >
                阅读文档 <ExternalLink className="w-3 h-3 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

