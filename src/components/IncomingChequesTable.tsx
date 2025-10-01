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
import { IncomingCheque } from "./AddIncomingChequeDialog";
import { format, isToday, parseISO } from "date-fns";

interface IncomingChequesTableProps {
  cheques: IncomingCheque[];
  onMarkDeposited: (id: string) => void;
  onDelete: (id: string) => void;
}

export function IncomingChequesTable({
  cheques,
  onMarkDeposited,
  onDelete,
}: IncomingChequesTableProps) {
  const activeCheques = cheques.filter((c) => c.status === "pending").sort((a, b) => {
    // Sort by received date in ascending order (oldest first)
    return a.receivedDate.localeCompare(b.receivedDate);
  });

  // Function to check if a cheque is ready based on received date comparison
  const isReady = (cheque: IncomingCheque) => {
    const receivedDate = parseISO(cheque.receivedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // receivedDate = today: Ready
    // receivedDate > today: Pending (not ready)
    // receivedDate < today: Ready
    return receivedDate <= today;
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
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-financial-blue-light mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Pending Incoming Cheques</h3>
        <p className="text-muted-foreground">
          All incoming cheques are deposited! Add a new one when you receive it.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-financial-blue-light">
            <TableHead className="font-semibold">Cheque Number</TableHead>
            <TableHead className="font-semibold">Payer Name</TableHead>
            <TableHead className="font-semibold">Amount</TableHead>
            <TableHead className="font-semibold">Bank Name</TableHead>
            <TableHead className="font-semibold">Cheque Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeCheques.map((cheque) => {
            const dueToday = isDueToday(cheque.chequeDate);
            const ready = isReady(cheque);
            return (
              <TableRow
                key={cheque.id}
                className={
                  dueToday
                    ? "bg-gradient-to-r from-warning-light/30 to-transparent border-l-4 border-l-warning shadow-sm"
                    : ready
                    ? "bg-gradient-to-r from-warning-light/30 to-transparent border-l-4 border-l-warning shadow-sm"
                    : "hover:shadow-sm"
                }
              >
                <TableCell className="font-mono font-medium">
                  <div className="flex items-center justify-between gap-2">
                    <span>{cheque.chequeNumber}</span>
                    <div className="flex items-center gap-1">
                      <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => onDelete(cheque.id)}
                      aria-label="Delete cheque"
                      title="Delete cheque"
                    >
                      <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{cheque.payerName}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(cheque.amount)}
                </TableCell>
                <TableCell>{cheque.bankName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {dueToday && (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                    {formatDate(cheque.chequeDate)}
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
                    {dueToday ? "Due Today" : ready ? "Ready to Deposit" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => onMarkDeposited(cheque.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Deposited
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
