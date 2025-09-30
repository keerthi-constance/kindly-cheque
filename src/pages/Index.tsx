import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddChequeDialog, Cheque } from "@/components/AddChequeDialog";
import { AddIncomingChequeDialog, IncomingCheque } from "@/components/AddIncomingChequeDialog";
import { ActiveChequesTable } from "@/components/ActiveChequesTable";
import { HistoryTable } from "@/components/HistoryTable";
import { IncomingChequesTable } from "@/components/IncomingChequesTable";
import { IncomingHistoryTable } from "@/components/IncomingHistoryTable";
import { FileCheck, History, LayoutDashboard, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { isToday, parseISO } from "date-fns";

const Index = () => {
  const [outgoingCheques, setOutgoingCheques] = useState<Cheque[]>(() => {
    const saved = localStorage.getItem("outgoingCheques");
    return saved ? JSON.parse(saved) : [];
  });

  const [incomingCheques, setIncomingCheques] = useState<IncomingCheque[]>(() => {
    const saved = localStorage.getItem("incomingCheques");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("outgoingCheques", JSON.stringify(outgoingCheques));
  }, [outgoingCheques]);

  useEffect(() => {
    localStorage.setItem("incomingCheques", JSON.stringify(incomingCheques));
  }, [incomingCheques]);

  useEffect(() => {
    const dueOutgoing = outgoingCheques.filter(
      (c) => c.status === "pending" && isToday(parseISO(c.startDate))
    );
    const dueIncoming = incomingCheques.filter(
      (c) => c.status === "pending" && isToday(parseISO(c.chequeDate))
    );

    if (dueOutgoing.length > 0) {
      toast({
        title: "⚠️ Outgoing Cheques Due Today!",
        description: `You have ${dueOutgoing.length} outgoing cheque(s) due for clearance today.`,
        variant: "default",
      });
    }

    if (dueIncoming.length > 0) {
      toast({
        title: "💰 Incoming Cheques Ready!",
        description: `You have ${dueIncoming.length} incoming cheque(s) ready to deposit today.`,
        variant: "default",
      });
    }
  }, []);

  const handleAddOutgoingCheque = (chequeData: Omit<Cheque, "id" | "status">) => {
    const newCheque: Cheque = {
      ...chequeData,
      id: Date.now().toString(),
      status: "pending",
    };
    setOutgoingCheques([...outgoingCheques, newCheque]);
  };

  const handleAddIncomingCheque = (chequeData: Omit<IncomingCheque, "id" | "status">) => {
    const newCheque: IncomingCheque = {
      ...chequeData,
      id: Date.now().toString(),
      status: "pending",
    };
    setIncomingCheques([...incomingCheques, newCheque]);
  };

  const handleMarkOutgoingComplete = (id: string) => {
    setOutgoingCheques(
      outgoingCheques.map((cheque) =>
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
      description: "Outgoing cheque marked as completed and moved to history.",
    });
  };

  const handleMarkIncomingDeposited = (id: string) => {
    setIncomingCheques(
      incomingCheques.map((cheque) =>
        cheque.id === id
          ? {
              ...cheque,
              status: "deposited" as const,
              depositedDate: new Date().toISOString().split("T")[0],
            }
          : cheque
      )
    );
    toast({
      title: "Cheque Deposited",
      description: "Incoming cheque marked as deposited and moved to history.",
    });
  };

  const activeOutgoing = outgoingCheques.filter((c) => c.status === "pending");
  const completedOutgoing = outgoingCheques.filter((c) => c.status === "completed");
  const activeIncoming = incomingCheques.filter((c) => c.status === "pending");
  const depositedIncoming = incomingCheques.filter((c) => c.status === "deposited");

  const totalOutgoingAmount = activeOutgoing.reduce((sum, c) => sum + c.amount, 0);
  const totalIncomingAmount = activeIncoming.reduce((sum, c) => sum + c.amount, 0);

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <FileCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Cheque Management System</h1>
                <p className="text-sm text-muted-foreground">
                  Track both incoming and outgoing cheques
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card bg-gradient-card border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outgoing Active</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeOutgoing.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(totalOutgoingAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incoming Active</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{activeIncoming.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(totalIncomingAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cleared Outgoing</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{completedOutgoing.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully processed</p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deposited Incoming</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{depositedIncoming.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully deposited</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs - Outgoing vs Incoming */}
        <Tabs defaultValue="outgoing" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="outgoing" className="gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              Cheques Out
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              Cheques In
            </TabsTrigger>
          </TabsList>

          {/* OUTGOING CHEQUES SECTION */}
          <TabsContent value="outgoing" className="space-y-6">
            <div className="flex justify-end">
              <AddChequeDialog onAddCheque={handleAddOutgoingCheque} />
            </div>

            <Tabs defaultValue="active" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Card className="shadow-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      Active Outgoing Cheques
                    </CardTitle>
                    <CardDescription>
                      Cheques you issued to others, pending clearance. Due dates are highlighted.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActiveChequesTable
                      cheques={outgoingCheques}
                      onMarkComplete={handleMarkOutgoingComplete}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="shadow-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Cleared Outgoing Cheques
                    </CardTitle>
                    <CardDescription>
                      History of all cleared outgoing cheques.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HistoryTable cheques={outgoingCheques} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* INCOMING CHEQUES SECTION */}
          <TabsContent value="incoming" className="space-y-6">
            <div className="flex justify-end">
              <AddIncomingChequeDialog onAddCheque={handleAddIncomingCheque} />
            </div>

            <Tabs defaultValue="active" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Card className="shadow-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      Active Incoming Cheques
                    </CardTitle>
                    <CardDescription>
                      Cheques you received from others, waiting to be deposited.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IncomingChequesTable
                      cheques={incomingCheques}
                      onMarkDeposited={handleMarkIncomingDeposited}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="shadow-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Deposited Incoming Cheques
                    </CardTitle>
                    <CardDescription>
                      History of all deposited incoming cheques.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IncomingHistoryTable cheques={incomingCheques} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
