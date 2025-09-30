import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddChequeDialog, Cheque } from "@/components/AddChequeDialog";
import { ActiveChequesTable } from "@/components/ActiveChequesTable";
import { HistoryTable } from "@/components/HistoryTable";
import { FileCheck, History, LayoutDashboard } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { isToday, parseISO } from "date-fns";

const Index = () => {
  const [cheques, setCheques] = useState<Cheque[]>(() => {
    const saved = localStorage.getItem("cheques");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cheques", JSON.stringify(cheques));
  }, [cheques]);

  useEffect(() => {
    const dueCheques = cheques.filter(
      (c) => c.status === "pending" && isToday(parseISO(c.startDate))
    );

    if (dueCheques.length > 0) {
      toast({
        title: "⚠️ Cheques Due Today!",
        description: `You have ${dueCheques.length} cheque(s) due for clearance today.`,
        variant: "default",
      });
    }
  }, []);

  const handleAddCheque = (chequeData: Omit<Cheque, "id" | "status">) => {
    const newCheque: Cheque = {
      ...chequeData,
      id: Date.now().toString(),
      status: "pending",
    };
    setCheques([...cheques, newCheque]);
  };

  const handleMarkComplete = (id: string) => {
    setCheques(
      cheques.map((cheque) =>
        cheque.id === id
          ? {
              ...cheque,
              status: "completed" as const,
              completedDate: new Date().toISOString().split("T")[0],
            }
          : cheque
      )
    );
    toast({
      title: "Cheque Cleared",
      description: "Cheque has been marked as completed and moved to history.",
    });
  };

  const activeCheques = cheques.filter((c) => c.status === "pending");
  const completedCheques = cheques.filter((c) => c.status === "completed");

  const totalActiveAmount = activeCheques.reduce((sum, c) => sum + c.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-financial-gray-light to-financial-blue-light">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <FileCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Cheque Out Management</h1>
                <p className="text-sm text-muted-foreground">
                  Track and manage your outgoing cheques
                </p>
              </div>
            </div>
            <AddChequeDialog onAddCheque={handleAddCheque} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cheques</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{activeCheques.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending clearance</p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(totalActiveAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">In active cheques</p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cleared Cheques</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{completedCheques.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="active" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Active Cheques
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Active Cheques
                </CardTitle>
                <CardDescription>
                  Pending cheques awaiting clearance. Due dates are highlighted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveChequesTable
                  cheques={cheques}
                  onMarkComplete={handleMarkComplete}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Cleared Cheques History
                </CardTitle>
                <CardDescription>
                  View all previously cleared and completed cheques.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HistoryTable cheques={cheques} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
