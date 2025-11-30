import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  Terminal, 
  Book
} from 'lucide-react';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group mb-1",
        isActive 
          ? "bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:pl-5"
      )
    }
  >
    <Icon className={cn("w-5 h-5 transition-colors", ({ isActive }: { isActive: boolean }) => isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
    <span>{label}</span>
  </NavLink>
);

export const Sidebar = () => {
  return (
    <div className="w-72 h-screen bg-[#0f1420]/95 border-r border-slate-800/60 flex flex-col fixed left-0 top-0 z-30 backdrop-blur-xl">
      <div className="p-8 flex items-center gap-4 border-b border-slate-800/60">
        <div className="w-14 h-14 relative group flex-shrink-0">
          <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg group-hover:bg-blue-500/40 transition-all duration-500"></div>
          <img src={logo} alt="Logo" className="w-full h-full object-contain relative z-10" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight gradient-text">NewmindEx</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wider">AI 平台</p>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 px-4">菜单</div>
        <SidebarItem to="/" icon={LayoutDashboard} label="仪表盘" />
        <SidebarItem to="/mcp" icon={Server} label="MCP 服务" />
        <SidebarItem to="/docs" icon={Book} label="文档中心" />
        <SidebarItem to="/logs" icon={Terminal} label="系统日志" />
      </nav>

      <div className="p-6 border-t border-slate-800/60">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">系统状态</p>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-emerald-400">所有服务运行正常</span>
          </div>
        </div>
      </div>
    </div>
  );
};
