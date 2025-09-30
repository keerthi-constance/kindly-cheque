import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AddChequeDialog, Cheque } from "@/components/AddChequeDialog";
import { AddIncomingChequeDialog, IncomingCheque } from "@/components/AddIncomingChequeDialog";
import { ActiveChequesTable } from "@/components/ActiveChequesTable";
import { HistoryTable } from "@/components/HistoryTable";
import { IncomingChequesTable } from "@/components/IncomingChequesTable";
import { IncomingHistoryTable } from "@/components/IncomingHistoryTable";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { StatCard } from "@/components/StatCard";
import { BankSummaryCard } from "@/components/BankSummaryCard";
import { 
  FileCheck, 
  History, 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle,
  TrendingUp,
  Wallet,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { isToday, parseISO } from "date-fns";

// Sample data generator
const generateSampleData = () => {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const sampleOutgoing: Cheque[] = [
    {
      id: "out1",
      issueDate: yesterday,
      startDate: today,
      chequeNumber: "CHQ001234",
      payeeName: "Rajesh Kumar",
      purpose: "Office rent payment",
      amount: 50000,
      bankName: "State Bank of India",
      status: "pending",
    },
    {
      id: "out2",
      issueDate: yesterday,
      startDate: today,
      chequeNumber: "CHQ001235",
      payeeName: "Priya Sharma",
      purpose: "Equipment purchase",
      amount: 125000,
      bankName: "HDFC Bank",
      status: "pending",
    },
    {
      id: "out3",
      issueDate: "2024-11-15",
      startDate: tomorrow,
      chequeNumber: "CHQ001236",
      payeeName: "Amit Patel",
      purpose: "Contractor payment",
      amount: 75000,
      bankName: "ICICI Bank",
      status: "pending",
    },
    {
      id: "out4",
      issueDate: "2024-11-20",
      startDate: nextWeek,
      chequeNumber: "CHQ001237",
      payeeName: "Sunita Desai",
      purpose: "Supplier payment",
      amount: 95000,
      bankName: "Axis Bank",
      status: "pending",
    },
    {
      id: "out5",
      issueDate: "2024-11-01",
      startDate: "2024-11-10",
      chequeNumber: "CHQ001230",
      payeeName: "Vikram Singh",
      purpose: "Service charges",
      amount: 35000,
      bankName: "State Bank of India",
      status: "completed",
      completedDate: "2024-11-12",
    },
    {
      id: "out6",
      issueDate: "2024-11-05",
      startDate: "2024-11-15",
      chequeNumber: "CHQ001231",
      payeeName: "Meena Reddy",
      purpose: "Utility bills",
      amount: 25000,
      bankName: "HDFC Bank",
      status: "completed",
      completedDate: "2024-11-16",
    },
  ];

  const sampleIncoming: IncomingCheque[] = [
    {
      id: "in1",
      receivedDate: yesterday,
      chequeDate: today,
      chequeNumber: "CHQ789012",
      payerName: "Anand Technologies",
      purpose: "Payment for services rendered",
      amount: 150000,
      bankName: "HDFC Bank",
      status: "pending",
    },
    {
      id: "in2",
      receivedDate: yesterday,
      chequeDate: today,
      chequeNumber: "CHQ789013",
      payerName: "Global Enterprises",
      purpose: "Project milestone payment",
      amount: 200000,
      bankName: "ICICI Bank",
      status: "pending",
    },
    {
      id: "in3",
      receivedDate: "2024-11-20",
      chequeDate: tomorrow,
      chequeNumber: "CHQ789014",
      payerName: "Shree Traders",
      purpose: "Invoice settlement",
      amount: 85000,
      bankName: "State Bank of India",
      status: "pending",
    },
    {
      id: "in4",
      receivedDate: "2024-11-18",
      chequeDate: nextWeek,
      chequeNumber: "CHQ789015",
      payerName: "Bharat Industries",
      purpose: "Advance payment",
      amount: 120000,
      bankName: "Axis Bank",
      status: "pending",
    },
    {
      id: "in5",
      receivedDate: "2024-11-01",
      chequeDate: "2024-11-08",
      chequeNumber: "CHQ789010",
      payerName: "Tech Solutions Inc",
      purpose: "Consulting fees",
      amount: 175000,
      bankName: "HDFC Bank",
      status: "deposited",
      depositedDate: "2024-11-09",
    },
    {
      id: "in6",
      receivedDate: "2024-11-05",
      chequeDate: "2024-11-12",
      chequeNumber: "CHQ789011",
      payerName: "Modern Retail",
      purpose: "Product payment",
      amount: 95000,
      bankName: "ICICI Bank",
      status: "deposited",
      depositedDate: "2024-11-13",
    },
  ];

  return { sampleOutgoing, sampleIncoming };
};

const Index = () => {
  const [showDemo, setShowDemo] = useState(true);
  const { sampleOutgoing, sampleIncoming } = generateSampleData();

  const [outgoingCheques, setOutgoingCheques] = useState<Cheque[]>(() => {
    const saved = localStorage.getItem("outgoingCheques");
    if (saved) {
      setShowDemo(false);
      return JSON.parse(saved);
    }
    return sampleOutgoing;
  });

  const [incomingCheques, setIncomingCheques] = useState<IncomingCheque[]>(() => {
    const saved = localStorage.getItem("incomingCheques");
    if (saved) return JSON.parse(saved);
    return sampleIncoming;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBank, setFilterBank] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    localStorage.setItem("outgoingCheques", JSON.stringify(outgoingCheques));
  }, [outgoingCheques]);

  useEffect(() => {
    localStorage.setItem("incomingCheques", JSON.stringify(incomingCheques));
  }, [incomingCheques]);

  useEffect(() => {
    if (!showDemo) return;

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
  }, [showDemo]);

  const handleAddOutgoingCheque = (chequeData: Omit<Cheque, "id" | "status">) => {
    const newCheque: Cheque = {
      ...chequeData,
      id: Date.now().toString(),
      status: "pending",
    };
    setOutgoingCheques([...outgoingCheques, newCheque]);
    setShowDemo(false);
  };

  const handleAddIncomingCheque = (chequeData: Omit<IncomingCheque, "id" | "status">) => {
    const newCheque: IncomingCheque = {
      ...chequeData,
      id: Date.now().toString(),
      status: "pending",
    };
    setIncomingCheques([...incomingCheques, newCheque]);
    setShowDemo(false);
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
      title: "✓ Cheque Cleared",
      description: "Outgoing cheque marked as completed.",
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
      title: "✓ Cheque Deposited",
      description: "Incoming cheque marked as deposited.",
    });
  };

  const handleClearDemoData = () => {
    setOutgoingCheques([]);
    setIncomingCheques([]);
    setShowDemo(false);
    toast({
      title: "Demo Data Cleared",
      description: "All demo data has been removed. Start fresh!",
    });
  };

  // Filtered data
  const filteredOutgoing = useMemo(() => {
    return outgoingCheques.filter((cheque) => {
      const matchesSearch =
        searchQuery === "" ||
        cheque.chequeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cheque.payeeName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBank = filterBank === "all" || cheque.bankName === filterBank;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" && cheque.status === "pending") ||
        (filterStatus === "due" && cheque.status === "pending" && isToday(parseISO(cheque.startDate)));

      return matchesSearch && matchesBank && matchesStatus;
    });
  }, [outgoingCheques, searchQuery, filterBank, filterStatus]);

  const filteredIncoming = useMemo(() => {
    return incomingCheques.filter((cheque) => {
      const matchesSearch =
        searchQuery === "" ||
        cheque.chequeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cheque.payerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBank = filterBank === "all" || cheque.bankName === filterBank;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" && cheque.status === "pending") ||
        (filterStatus === "due" && cheque.status === "pending" && isToday(parseISO(cheque.chequeDate)));

      return matchesSearch && matchesBank && matchesStatus;
    });
  }, [incomingCheques, searchQuery, filterBank, filterStatus]);

  const activeOutgoing = outgoingCheques.filter((c) => c.status === "pending");
  const completedOutgoing = outgoingCheques.filter((c) => c.status === "completed");
  const activeIncoming = incomingCheques.filter((c) => c.status === "pending");
  const depositedIncoming = incomingCheques.filter((c) => c.status === "deposited");

  const totalOutgoingAmount = activeOutgoing.reduce((sum, c) => sum + c.amount, 0);
  const totalIncomingAmount = activeIncoming.reduce((sum, c) => sum + c.amount, 0);
  const netCashFlow = totalIncomingAmount - totalOutgoingAmount;

  const allBanks = Array.from(
    new Set([...outgoingCheques.map((c) => c.bankName), ...incomingCheques.map((c) => c.bankName)])
  );

  // Bank summaries
  const outgoingByBank = allBanks
    .map((bank) => ({
      bank,
      count: activeOutgoing.filter((c) => c.bankName === bank).length,
      amount: activeOutgoing.filter((c) => c.bankName === bank).reduce((sum, c) => sum + c.amount, 0),
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.amount - a.amount);

  const incomingByBank = allBanks
    .map((bank) => ({
      bank,
      count: activeIncoming.filter((c) => c.bankName === bank).length,
      amount: activeIncoming.filter((c) => c.bankName === bank).reduce((sum, c) => sum + c.amount, 0),
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.amount - a.amount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary-light/20">
      {/* Header with Gradient */}
      <header className="bg-gradient-header border-b shadow-elevated sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl shadow-glow">
                <FileCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Cheque Management System
                </h1>
                <p className="text-sm text-white/90 font-medium">
                  Track, manage & analyze all your cheque transactions
                </p>
              </div>
            </div>
            {showDemo && (
              <Button
                variant="outline"
                onClick={handleClearDemoData}
                className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30"
              >
                Clear Demo Data
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <StatCard
            title="Outgoing Active"
            value={activeOutgoing.length}
            subtitle={formatCurrency(totalOutgoingAmount)}
            icon={ArrowUpCircle}
            iconColor="text-destructive"
            gradientClass="border-l-destructive"
          />

          <StatCard
            title="Incoming Active"
            value={activeIncoming.length}
            subtitle={formatCurrency(totalIncomingAmount)}
            icon={ArrowDownCircle}
            iconColor="text-success"
            gradientClass="border-l-success"
          />

          <StatCard
            title="Net Cash Flow"
            value={formatCurrency(Math.abs(netCashFlow))}
            subtitle={netCashFlow >= 0 ? "Positive balance" : "Negative balance"}
            icon={TrendingUp}
            iconColor={netCashFlow >= 0 ? "text-success" : "text-destructive"}
            gradientClass={netCashFlow >= 0 ? "border-l-success" : "border-l-destructive"}
            trend={{
              value: `${((Math.abs(netCashFlow) / (totalIncomingAmount || 1)) * 100).toFixed(1)}%`,
              isPositive: netCashFlow >= 0,
            }}
          />

          <StatCard
            title="Total Processed"
            value={completedOutgoing.length + depositedIncoming.length}
            subtitle={`${completedOutgoing.length} out, ${depositedIncoming.length} in`}
            icon={BarChart3}
            iconColor="text-primary"
            gradientClass="border-l-primary"
          />
        </div>

        {/* Bank Summary Section */}
        <BankSummaryCard outgoingBanks={outgoingByBank} incomingBanks={incomingByBank} />

        {/* Main Tabs */}
        <Tabs defaultValue="outgoing" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-2 mx-auto h-12 bg-card shadow-card">
            <TabsTrigger value="outgoing" className="gap-2 data-[state=active]:bg-destructive-light data-[state=active]:text-destructive">
              <ArrowUpCircle className="h-4 w-4" />
              <span className="font-semibold">Cheques Out</span>
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2 data-[state=active]:bg-success-light data-[state=active]:text-success">
              <ArrowDownCircle className="h-4 w-4" />
              <span className="font-semibold">Cheques In</span>
            </TabsTrigger>
          </TabsList>

          {/* OUTGOING CHEQUES */}
          <TabsContent value="outgoing" className="space-y-6">
            <div className="flex justify-end">
              <AddChequeDialog onAddCheque={handleAddOutgoingCheque} />
            </div>

            <SearchFilterBar
              onSearch={setSearchQuery}
              onFilterBank={setFilterBank}
              onFilterStatus={setFilterStatus}
              banks={allBanks}
            />

            <Tabs defaultValue="active" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-card shadow-sm">
                <TabsTrigger value="active" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Active ({activeOutgoing.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  History ({completedOutgoing.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Card className="shadow-elevated hover-lift">
                  <CardHeader className="bg-gradient-to-r from-destructive-light to-transparent">
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <LayoutDashboard className="h-5 w-5" />
                      Active Outgoing Cheques
                    </CardTitle>
                    <CardDescription>
                      Cheques you issued to others. Due dates are highlighted.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ActiveChequesTable
                      cheques={filteredOutgoing}
                      onMarkComplete={handleMarkOutgoingComplete}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="shadow-elevated hover-lift">
                  <CardHeader className="bg-gradient-to-r from-success-light to-transparent">
                    <CardTitle className="flex items-center gap-2 text-success">
                      <History className="h-5 w-5" />
                      Cleared Outgoing Cheques
                    </CardTitle>
                    <CardDescription>History of all cleared outgoing cheques.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <HistoryTable cheques={outgoingCheques} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* INCOMING CHEQUES */}
          <TabsContent value="incoming" className="space-y-6">
            <div className="flex justify-end">
              <AddIncomingChequeDialog onAddCheque={handleAddIncomingCheque} />
            </div>

            <SearchFilterBar
              onSearch={setSearchQuery}
              onFilterBank={setFilterBank}
              onFilterStatus={setFilterStatus}
              banks={allBanks}
            />

            <Tabs defaultValue="active" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-card shadow-sm">
                <TabsTrigger value="active" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  Active ({activeIncoming.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  History ({depositedIncoming.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Card className="shadow-elevated hover-lift">
                  <CardHeader className="bg-gradient-to-r from-success-light to-transparent">
                    <CardTitle className="flex items-center gap-2 text-success">
                      <LayoutDashboard className="h-5 w-5" />
                      Active Incoming Cheques
                    </CardTitle>
                    <CardDescription>
                      Cheques you received, waiting to be deposited.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <IncomingChequesTable
                      cheques={filteredIncoming}
                      onMarkDeposited={handleMarkIncomingDeposited}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="shadow-elevated hover-lift">
                  <CardHeader className="bg-gradient-to-r from-primary-light to-transparent">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <History className="h-5 w-5" />
                      Deposited Incoming Cheques
                    </CardTitle>
                    <CardDescription>History of all deposited incoming cheques.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
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
