import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
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
    <Card className={`shadow-card hover-lift border-l-4 ${gradientClass} overflow-hidden relative`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground/80">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconColor} bg-opacity-10`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            {subtitle}
            {trend && (
              <span className={trend.isPositive ? "text-success" : "text-destructive"}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
