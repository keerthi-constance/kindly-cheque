import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Cheque } from "./AddChequeDialog";
import { format, isToday, parseISO } from "date-fns";

interface ActiveChequesTableProps {
  cheques: Cheque[];
  onMarkComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ActiveChequesTable({
  cheques,
  onMarkComplete,
  onDelete,
}: ActiveChequesTableProps) {
  const activeCheques = cheques.filter((c) => c.status === "pending").sort((a, b) => {
    // Sort by start date in ascending order (oldest first)
    // Since dates are in YYYY-MM-DD format, we can compare them as strings
    return a.startDate.localeCompare(b.startDate);
  });

  // Function to check if a cheque is ready based on start date comparison
  const isReady = (cheque: Cheque) => {
    const startDate = parseISO(cheque.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // startDate = today: Ready
    // startDate > today: Pending (not ready)
    // startDate < today: Ready
    return startDate <= today;
  };

  const isDueToday = (dateString: string) => {
    try {
      return isToday(parseISO(dateString));
    } catch {
      return false;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  if (activeCheques.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-success to-success-dark mb-6 shadow-glow-success animate-pulse-glow">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-3 gradient-text-success">No Active Cheques</h3>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          All cheques are cleared! Add a new cheque to get started with your financial tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-glass-card shadow-elevated overflow-hidden backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-accent/10 to-accent/5 border-b-2 border-accent/20">
            <TableHead className="font-bold text-accent text-sm uppercase tracking-wider py-4">Cheque Number</TableHead>
            <TableHead className="font-bold text-accent text-sm uppercase tracking-wider py-4">Payee Name</TableHead>
            <TableHead className="font-bold text-accent text-sm uppercase tracking-wider py-4">Amount</TableHead>
            <TableHead className="font-bold text-accent text-sm uppercase tracking-wider py-4">Bank Name</TableHead>
            <TableHead className="font-bold text-accent text-sm uppercase tracking-wider py-4">Start Date</TableHead>
            <TableHead className="font-bold text-accent text-sm uppercase tracking-wider py-4">Status</TableHead>
            <TableHead className="font-bold text-accent text-sm uppercase tracking-wider py-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeCheques.map((cheque) => {
            const dueToday = isDueToday(cheque.startDate);
            const ready = isReady(cheque);
            return (
              <TableRow
                key={cheque.id}
                className={`group hover:bg-gradient-to-r hover:from-accent/5 hover:to-transparent transition-all duration-300 ${
                  dueToday
                    ? "bg-gradient-to-r from-warning-light/30 to-transparent border-l-4 border-l-warning shadow-sm"
                    : ready
                    ? "bg-gradient-to-r from-warning-light/30 to-transparent border-l-4 border-l-warning shadow-sm"
                    : "hover:shadow-sm"
                }`}
              >
                <TableCell className="font-mono font-medium">
                  <div className="flex items-center justify-between gap-2">
                    <span>{cheque.chequeNumber}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:scale-110"
                        onClick={() => onDelete(cheque.id)}
                        aria-label="Delete cheque"
                        title="Delete cheque"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{cheque.payeeName}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(cheque.amount)}
                </TableCell>
                <TableCell>{cheque.bankName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {dueToday && (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                    {formatDate(cheque.startDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={dueToday ? "default" : ready ? "default" : "secondary"}
                    className={`font-semibold px-3 py-1 ${
                      dueToday 
                        ? "bg-gradient-to-r from-warning to-warning-dark text-white shadow-glow" 
                        : ready
                        ? "bg-gradient-to-r from-warning to-warning-dark text-white shadow-glow"
                        : "bg-gradient-to-r from-muted to-muted/80 text-muted-foreground"
                    }`}
                  >
                    {dueToday ? "Due Today" : ready ? "Ready" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success text-white border-success hover:shadow-glow-success transition-all duration-300 hover:scale-105"
                    onClick={() => onMarkComplete(cheque.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Complete
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
