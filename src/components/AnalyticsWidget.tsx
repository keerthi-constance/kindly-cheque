import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  PieChart,
  BarChart3,
  Activity
} from "lucide-react";

interface AnalyticsWidgetProps {
  outgoingCheques: any[];
  incomingCheques: any[];
}

export function AnalyticsWidget({ outgoingCheques, incomingCheques }: AnalyticsWidgetProps) {
  // Calculate analytics data
  const totalOutgoing = outgoingCheques.reduce((sum, cheque) => sum + cheque.amount, 0);
  const totalIncoming = incomingCheques.reduce((sum, cheque) => sum + cheque.amount, 0);
  const netFlow = totalIncoming - totalOutgoing;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const activeOutgoing = outgoingCheques.filter(c => c.status === 'pending');
  const activeIncoming = incomingCheques.filter(c => c.status === 'pending');
  
  const completedOutgoing = outgoingCheques.filter(c => c.status === 'completed');
  const depositedIncoming = incomingCheques.filter(c => c.status === 'deposited');
  
  const completionRate = outgoingCheques.length > 0 
    ? (completedOutgoing.length / outgoingCheques.length) * 100 
    : 0;
    
  const depositRate = incomingCheques.length > 0 
    ? (depositedIncoming.length / incomingCheques.length) * 100 
    : 0;

  // Bank distribution
  const bankDistribution = [...outgoingCheques, ...incomingCheques].reduce((acc, cheque) => {
    acc[cheque.bankName] = (acc[cheque.bankName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBanks = Object.entries(bankDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
      {/* Cash Flow Analysis */}
      <Card className="bg-glass-card shadow-elevated border border-white/20 hover-glow transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-primary-dark rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold gradient-text-purple">Cash Flow Analysis</CardTitle>
              <CardDescription>Real-time financial overview</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-success-light/50 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-success mb-1">
                {formatCurrency(totalIncoming)}
              </div>
              <div className="text-sm text-muted-foreground">Total Incoming</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-destructive-light/50 to-transparent rounded-lg">
              <div className="text-2xl font-bold text-destructive mb-1">
                {formatCurrency(totalOutgoing)}
              </div>
              <div className="text-sm text-muted-foreground">Total Outgoing</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Net Cash Flow</span>
              <span className={`font-semibold ${netFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                {netFlow >= 0 ? '+' : ''}{formatCurrency(Math.abs(netFlow))}
              </span>
            </div>
            <Progress 
              value={Math.min(100, Math.max(0, (netFlow / Math.max(totalIncoming, totalOutgoing)) * 100 + 50))} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Processing Rates */}
      <Card className="bg-glass-card shadow-elevated border border-white/20 hover-glow transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-accent to-accent-dark rounded-lg">
              <PieChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold gradient-text-purple">Processing Rates</CardTitle>
              <CardDescription>Efficiency metrics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Outgoing Completion</span>
              <Badge className="bg-gradient-to-r from-primary to-primary-dark text-white">
                {completionRate.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Incoming Deposit</span>
              <Badge className="bg-gradient-to-r from-success to-success-dark text-white">
                {depositRate.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={depositRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Bank Distribution */}
      <Card className="bg-glass-card shadow-elevated border border-white/20 hover-glow transition-all duration-300 lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-info to-info-dark rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold gradient-text-purple">Bank Distribution</CardTitle>
              <CardDescription>Cheque distribution across banks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topBanks.map(([bank, count], index) => {
              const percentage = (count / (outgoingCheques.length + incomingCheques.length)) * 100;
              const colors = [
                'from-primary to-primary-dark',
                'from-accent to-accent-dark', 
                'from-success to-success-dark',
                'from-warning to-warning-dark',
                'from-info to-info-dark'
              ];
              
              return (
                <div key={bank} className="p-4 bg-gradient-to-br from-muted/30 to-transparent rounded-lg hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate">{bank}</span>
                    <Badge className={`bg-gradient-to-r ${colors[index % colors.length]} text-white`}>
                      {count}
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {percentage.toFixed(1)}% of total
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
