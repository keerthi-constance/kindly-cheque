import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp } from "lucide-react";

interface BankSummary {
  bank: string;
  count: number;
  amount: number;
}

interface BankSummaryCardProps {
  outgoingBanks: BankSummary[];
  incomingBanks: BankSummary[];
}

export function BankSummaryCard({ outgoingBanks, incomingBanks }: BankSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="shadow-card hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Building2 className="h-5 w-5" />
            Outgoing by Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {outgoingBanks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active outgoing cheques</p>
          ) : (
            outgoingBanks.map((item) => (
              <div key={item.bank} className="flex items-center justify-between p-3 bg-destructive-light rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="font-medium text-sm">{item.bank}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{formatCurrency(item.amount)}</div>
                  <div className="text-xs text-muted-foreground">{item.count} cheque{item.count !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <TrendingUp className="h-5 w-5" />
            Incoming by Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incomingBanks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active incoming cheques</p>
          ) : (
            incomingBanks.map((item) => (
              <div key={item.bank} className="flex items-center justify-between p-3 bg-success-light rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="font-medium text-sm">{item.bank}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{formatCurrency(item.amount)}</div>
                  <div className="text-xs text-muted-foreground">{item.count} cheque{item.count !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
