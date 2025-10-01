import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CheckCircle2, History } from "lucide-react";
import { IncomingCheque } from "./AddIncomingChequeDialog";
import { format, parseISO } from "date-fns";

interface IncomingHistoryTableProps {
  cheques: IncomingCheque[];
  onDelete: (id: string) => void;
}

export function IncomingHistoryTable({ cheques, onDelete }: IncomingHistoryTableProps) {
  const depositedCheques = cheques.filter((c) => c.status === "deposited").sort((a, b) => {
    // Sort by received date in ascending order (oldest first)
    return a.receivedDate.localeCompare(b.receivedDate);
  });

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

  if (depositedCheques.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-light mb-4">
          <History className="h-8 w-8 text-success" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No History Yet</h3>
        <p className="text-muted-foreground">
          Deposited incoming cheques will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-success-light">
            <TableHead className="font-semibold">Cheque Number</TableHead>
            <TableHead className="font-semibold">Payer Name</TableHead>
            <TableHead className="font-semibold">Amount</TableHead>
            <TableHead className="font-semibold">Bank Name</TableHead>
            <TableHead className="font-semibold">Cheque Date</TableHead>
            <TableHead className="font-semibold">Deposited Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {depositedCheques.map((cheque) => (
            <TableRow key={cheque.id}>
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
              <TableCell>{formatDate(cheque.chequeDate)}</TableCell>
              <TableCell>{formatDate(cheque.depositedDate || "")}</TableCell>
              <TableCell>
                <Badge className="bg-success text-success-foreground gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Deposited
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
