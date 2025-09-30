import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Cheque } from "./AddChequeDialog";
import { format, isToday, parseISO } from "date-fns";

interface ActiveChequesTableProps {
  cheques: Cheque[];
  onMarkComplete: (id: string) => void;
}

export function ActiveChequesTable({
  cheques,
  onMarkComplete,
}: ActiveChequesTableProps) {
  const activeCheques = cheques.filter((c) => c.status === "pending");

  const isDueToday = (dateString: string) => {
    try {
      return isToday(parseISO(dateString));
    } catch {
      return false;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
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
        <h3 className="text-lg font-semibold mb-2">No Active Cheques</h3>
        <p className="text-muted-foreground">
          All cheques are cleared! Add a new cheque to get started.
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
            <TableHead className="font-semibold">Payee Name</TableHead>
            <TableHead className="font-semibold">Amount</TableHead>
            <TableHead className="font-semibold">Bank Name</TableHead>
            <TableHead className="font-semibold">Start Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeCheques.map((cheque) => {
            const dueToday = isDueToday(cheque.startDate);
            return (
              <TableRow
                key={cheque.id}
                className={
                  dueToday
                    ? "bg-warning-light hover:bg-warning-light/80 border-l-4 border-l-warning"
                    : ""
                }
              >
                <TableCell className="font-mono font-medium">
                  {cheque.chequeNumber}
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
                    variant={dueToday ? "default" : "secondary"}
                    className={dueToday ? "bg-warning text-warning-foreground" : ""}
                  >
                    {dueToday ? "Due Today" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
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
