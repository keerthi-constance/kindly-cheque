import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface IncomingCheque {
  id: string;
  receivedDate: string;
  chequeDate: string;
  chequeNumber: string;
  payerName: string;
  purpose: string;
  amount: number;
  bankName: string;
  status: "pending" | "deposited";
  depositedDate?: string;
}

interface AddIncomingChequeDialogProps {
  onAddCheque: (cheque: Omit<IncomingCheque, "id" | "status">) => void;
}

export function AddIncomingChequeDialog({ onAddCheque }: AddIncomingChequeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    receivedDate: "",
    chequeDate: "",
    chequeNumber: "",
    payerName: "",
    purpose: "",
    amount: "",
    bankName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.receivedDate ||
      !formData.chequeDate ||
      !formData.chequeNumber ||
      !formData.payerName ||
      !formData.amount ||
      !formData.bankName
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onAddCheque({
      receivedDate: formData.receivedDate,
      chequeDate: formData.chequeDate,
      chequeNumber: formData.chequeNumber,
      payerName: formData.payerName,
      purpose: formData.purpose,
      amount: parseFloat(formData.amount),
      bankName: formData.bankName,
    });

    setFormData({
      receivedDate: "",
      chequeDate: "",
      chequeNumber: "",
      payerName: "",
      purpose: "",
      amount: "",
      bankName: "",
    });

    setOpen(false);
    toast({
      title: "Incoming Cheque Added",
      description: "New incoming cheque has been added successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Incoming Cheque
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Incoming Cheque</DialogTitle>
          <DialogDescription>
            Enter the details of a cheque you received from someone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receivedDate">Received Date *</Label>
                <Input
                  id="receivedDate"
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, receivedDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chequeDate">Cheque Date *</Label>
                <Input
                  id="chequeDate"
                  type="date"
                  value={formData.chequeDate}
                  onChange={(e) =>
                    setFormData({ ...formData, chequeDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chequeNumber">Cheque Number *</Label>
              <Input
                id="chequeNumber"
                value={formData.chequeNumber}
                onChange={(e) =>
                  setFormData({ ...formData, chequeNumber: e.target.value })
                }
                placeholder="e.g., CHQ001234"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payerName">Payer Name *</Label>
              <Input
                id="payerName"
                value={formData.payerName}
                onChange={(e) =>
                  setFormData({ ...formData, payerName: e.target.value })
                }
                placeholder="Name of person who gave you the cheque"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                placeholder="e.g., HDFC Bank"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose / Notes</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                placeholder="Optional notes about this cheque"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Cheque</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
