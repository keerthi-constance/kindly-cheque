import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: ReactNode;
  icon: LucideIcon;
  iconColor: string;
  gradientClass: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor,
  gradientClass,
  trend 
}: StatCardProps) {
  return (
    <Card className={`shadow-card hover-lift border-l-4 ${gradientClass} overflow-hidden relative group transition-all duration-300 h-full flex flex-col bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm`}>
      {/* Enhanced Background Effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold text-foreground/90 tracking-wide">{title}</CardTitle>
        <div className={`p-3 rounded-xl ${iconColor} bg-opacity-15 group-hover:bg-opacity-25 transition-all duration-300 group-hover:scale-110 shadow-lg`}>
          <Icon className={`h-6 w-6 ${iconColor} group-hover:animate-pulse drop-shadow-sm`} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex-grow flex flex-col justify-between">
        <div className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 drop-shadow-sm">
          {value}
        </div>
        {subtitle && (
          <div className="mt-2 flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {subtitle}
            </div>
            {trend && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trend.isPositive 
                  ? "text-success bg-success-light/20" 
                  : "text-destructive bg-destructive-light/20"
              }`}>
                {trend.isPositive ? "↗" : "↘"} {trend.value}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
