import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, asChild, ...props }, ref) => {
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 border border-transparent',
      secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
      outline: 'border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200',
      ghost: 'hover:bg-slate-800 hover:text-slate-200',
      link: 'text-blue-400 underline-offset-4 hover:underline',
      destructive: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Card Components
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 shadow-sm backdrop-blur-sm',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight text-white', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: 'border-transparent bg-blue-500/20 text-blue-400 border border-blue-500/30',
    secondary: 'border-transparent bg-slate-800 text-slate-400',
    destructive: 'border-transparent bg-red-500/10 text-red-500',
    outline: 'text-slate-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

// Status Indicator
export const StatusIndicator = ({ status }: { status: string }) => {
  const isRunning = status === 'running';
  const isStopped = status === 'stopped';
  const isPartial = status === 'partial';
  
  let badgeClass = "bg-slate-700 text-slate-400 border-slate-600";
  let text = status?.toUpperCase() || '未知';
  
  if (isRunning) {
    badgeClass = "status-badge-running";
    text = "运行中";
  } else if (isStopped) {
    badgeClass = "status-badge-stopped";
    text = "已停止";
  } else if (isPartial) {
    badgeClass = "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 border animate-pulse";
    text = "部分运行";
  }

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] tracking-wider border uppercase backdrop-blur-md", badgeClass)}>
      {text}
    </span>
  );
};
