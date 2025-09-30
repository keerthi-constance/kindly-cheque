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

export interface Cheque {
  id: string;
  issueDate: string;
  startDate: string;
  chequeNumber: string;
  payeeName: string;
  purpose: string;
  amount: number;
  bankName: string;
  status: "pending" | "completed";
  completedDate?: string;
}

interface AddChequeDialogProps {
  onAddCheque: (cheque: Omit<Cheque, "id" | "status">) => void;
}

export function AddChequeDialog({ onAddCheque }: AddChequeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    issueDate: "",
    startDate: "",
    chequeNumber: "",
    payeeName: "",
    purpose: "",
    amount: "",
    bankName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.issueDate ||
      !formData.startDate ||
      !formData.chequeNumber ||
      !formData.payeeName ||
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
      issueDate: formData.issueDate,
      startDate: formData.startDate,
      chequeNumber: formData.chequeNumber,
      payeeName: formData.payeeName,
      purpose: formData.purpose,
      amount: parseFloat(formData.amount),
      bankName: formData.bankName,
    });

    setFormData({
      issueDate: "",
      startDate: "",
      chequeNumber: "",
      payeeName: "",
      purpose: "",
      amount: "",
      bankName: "",
    });

    setOpen(false);
    toast({
      title: "Cheque Added",
      description: "New cheque has been added successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Cheque
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Cheque</DialogTitle>
          <DialogDescription>
            Enter the details of the new outgoing cheque.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
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
              <Label htmlFor="payeeName">Payee Name *</Label>
              <Input
                id="payeeName"
                value={formData.payeeName}
                onChange={(e) =>
                  setFormData({ ...formData, payeeName: e.target.value })
                }
                placeholder="Name of recipient"
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
                placeholder="e.g., State Bank of India"
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
