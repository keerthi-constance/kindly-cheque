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
import { AnalyticsWidget } from "@/components/AnalyticsWidget";
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
import { api } from "@/lib/utils";
import { isToday, parseISO } from "date-fns";


const Index = () => {
  const isDbId = (value: string) => /^[a-f0-9]{24}$/i.test(value);

  const [outgoingCheques, setOutgoingCheques] = useState<Cheque[]>([]);
  const [incomingCheques, setIncomingCheques] = useState<IncomingCheque[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBank, setFilterBank] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [out, inc] = await Promise.all([
          api.get<Cheque[]>("/api/outgoing"),
          api.get<IncomingCheque[]>("/api/incoming"),
        ]);
        
        console.log('🔄 Loading from API - Outgoing:', out?.length, 'Incoming:', inc?.length);
        console.log('📋 API Outgoing statuses:', out?.map(c => ({ id: c.id, status: c.status, number: c.chequeNumber })));
        
        // Use API data as the source of truth
        setOutgoingCheques(out || []);
        setIncomingCheques(inc || []);
      } catch (error) {
        console.error("Error loading data:", error);
        // If API fails, start with empty arrays
        setOutgoingCheques([]);
        setIncomingCheques([]);
      }
    };
    load();
  }, []);



  const handleAddOutgoingCheque = async (chequeData: Omit<Cheque, "id" | "status">) => {
    try {
      const created = await api.post<Cheque>("/api/outgoing", chequeData);
      setOutgoingCheques([...outgoingCheques, created]);
    } catch {
      const newCheque: Cheque = {
        ...chequeData,
        id: Date.now().toString(),
        status: "pending",
      };
      setOutgoingCheques([...outgoingCheques, newCheque]);
    }
  };

  const handleAddIncomingCheque = async (chequeData: Omit<IncomingCheque, "id" | "status">) => {
    try {
      const created = await api.post<IncomingCheque>("/api/incoming", chequeData);
      setIncomingCheques([...incomingCheques, created]);
    } catch {
      const newCheque: IncomingCheque = {
        ...chequeData,
        id: Date.now().toString(),
        status: "pending",
      };
      setIncomingCheques([...incomingCheques, newCheque]);
    }
  };

  const handleMarkOutgoingComplete = async (id: string) => {
    console.log('🎯 Marking cheque as complete:', id, 'isDbId:', isDbId(id));
    
    // Always try to update via API first if we have a valid database ID
    if (isDbId(id)) {
      try {
        console.log('🌐 Updating via API');
        const updated = await api.post<Cheque>(`/api/outgoing/${id}/complete`, {});
        console.log('✅ API response:', updated);
        
        // Update local state with the API response
        const updatedCheques = outgoingCheques.map((c) => 
          c.id === id || c.id === (updated as any)._id 
            ? { ...c, ...updated, id: (updated as any)._id || c.id, status: "completed" as const }
            : c
        );
        console.log('📊 Updated cheques after API:', updatedCheques.map(c => ({ id: c.id, status: c.status, number: c.chequeNumber })));
        setOutgoingCheques(updatedCheques);
        
      toast({
        title: "✓ Cheque Cleared",
        description: "Outgoing cheque marked as completed.",
      });
      return;
      } catch (error) {
        console.log('❌ API error, falling back to local update:', error);
        // Fall through to local update
      }
    }
    
    // Fallback to local update for demo cheques or if API fails
    console.log('📝 Updating local state');
    const updatedCheques = outgoingCheques.map((cheque) =>
          cheque.id === id
            ? {
                ...cheque,
                status: "completed" as const,
                completedDate: new Date().toISOString().split("T")[0],
              }
            : cheque
      );
    console.log('📊 Updated cheques statuses:', updatedCheques.map(c => ({ id: c.id, status: c.status, number: c.chequeNumber })));
    setOutgoingCheques(updatedCheques);
    
    toast({
      title: "✓ Cheque Cleared",
      description: "Outgoing cheque marked as completed.",
    });
  };

  const handleMarkIncomingDeposited = async (id: string) => {
    if (!isDbId(id)) {
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
      return;
    }
    try {
      const updated = await api.post<IncomingCheque>(`/api/incoming/${id}/deposit`, {});
      setIncomingCheques(incomingCheques.map((c) => (c.id === (updated as any)._id || c.id === id ? { ...c, ...updated, id: (updated as any)._id || c.id } : c)));
    } catch {
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
    }
    toast({
      title: "✓ Cheque Deposited",
      description: "Incoming cheque marked as deposited.",
    });
  };

  const handleDeleteOutgoing = async (id: string) => {
    if (!isDbId(id)) {
      setOutgoingCheques(outgoingCheques.filter((c) => c.id !== id));
      toast({ title: "Deleted", description: "Outgoing cheque removed." });
      return;
    }
    try {
      await api.post(`/api/outgoing/${id}/delete`, {} as any);
      setOutgoingCheques(outgoingCheques.filter((c) => c.id !== id));
    } catch {
      setOutgoingCheques(outgoingCheques.filter((c) => c.id !== id));
    }
    toast({ title: "Deleted", description: "Outgoing cheque removed." });
  };

  const handleDeleteIncoming = async (id: string) => {
    if (!isDbId(id)) {
      setIncomingCheques(incomingCheques.filter((c) => c.id !== id));
      toast({ title: "Deleted", description: "Incoming cheque removed." });
      return;
    }
    try {
      await api.post(`/api/incoming/${id}/delete`, {} as any);
      setIncomingCheques(incomingCheques.filter((c) => c.id !== id));
    } catch {
      setIncomingCheques(incomingCheques.filter((c) => c.id !== id));
    }
    toast({ title: "Deleted", description: "Incoming cheque removed." });
  };





  // Filtered data
  const filteredOutgoing = useMemo(() => {
    console.log('🔍 Filtering outgoing cheques:', outgoingCheques.length, 'total');
    console.log('📊 All cheque statuses:', outgoingCheques.map(c => ({ id: c.id, status: c.status, number: c.chequeNumber })));
    
    const filtered = outgoingCheques.filter((cheque) => {
      // Only show pending cheques in the active tab
      if (cheque.status !== "pending") {
        console.log('❌ Filtering out completed cheque:', cheque.chequeNumber, 'status:', cheque.status);
        return false;
      }

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
    
    console.log('✅ Filtered result:', filtered.length, 'pending cheques');
    return filtered;
  }, [outgoingCheques, searchQuery, filterBank, filterStatus]);

  const filteredIncoming = useMemo(() => {
    return incomingCheques.filter((cheque) => {
      // Only show pending cheques in the active tab
      if (cheque.status !== "pending") return false;

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


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary-light/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-success/20 to-info/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-warning/10 to-accent/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Enhanced Header with Gradient */}
      <header className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 border-b shadow-elevated sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-blue-600/30 animate-gradient" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-40 -translate-x-40"></div>
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6 animate-slide-in">
              <div className="relative">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-glow-purple hover-glow-purple transition-all duration-300">
                  <FileCheck className="h-8 w-8 text-white animate-float" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white tracking-tight bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent drop-shadow-lg">
                  ROJAR STALIN
                  CHEQUE MANAGEMENT SYSTEM
                </h1>
                <p className="text-xl text-cyan-100 font-semibold mt-2">
                  Track, manage & analyze all your cheque transactions
                </p>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2 text-sm text-cyan-200 font-medium">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg" />
                    <span>System Online</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-cyan-200 font-medium">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.5s' }} />
                    <span>Real-time Updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-cyan-200 font-medium">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1s' }} />
                    <span>Secure & Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up h-32">
          <div className="animate-bounce-in" style={{ animationDelay: '0.1s' }}>
            <StatCard
              title="Outgoing Active"
              value={activeOutgoing.length}
              subtitle={formatCurrency(totalOutgoingAmount)}
              icon={ArrowUpCircle}
              iconColor="text-orange-500"
              gradientClass="border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-orange-200"
            />
          </div>

          <div className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <StatCard
              title="Incoming Active"
              value={activeIncoming.length}
              subtitle={formatCurrency(totalIncomingAmount)}
              icon={ArrowDownCircle}
              iconColor="text-emerald-500"
              gradientClass="border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-emerald-200"
            />
          </div>

          <div className="animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            <StatCard
              title="Net Cash Flow"
              value={formatCurrency(Math.abs(netCashFlow))}
              subtitle={netCashFlow >= 0 ? "Positive balance" : "Negative balance"}
              icon={TrendingUp}
              iconColor={netCashFlow >= 0 ? "text-green-500" : "text-red-500"}
              gradientClass={netCashFlow >= 0 ? "border-l-green-500 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-green-200" : "border-l-red-500 bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-red-200"}
              trend={{
                value: `${((Math.abs(netCashFlow) / (totalIncomingAmount || 1)) * 100).toFixed(1)}%`,
                isPositive: netCashFlow >= 0,
              }}
            />
          </div>

          <div className="animate-bounce-in" style={{ animationDelay: '0.4s' }}>
            <StatCard
              title="Total Processed"
              value={completedOutgoing.length + depositedIncoming.length}
              subtitle={`${completedOutgoing.length} out, ${depositedIncoming.length} in`}
              icon={BarChart3}
              iconColor="text-purple-500"
              gradientClass="border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-purple-200"
            />
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center py-12 animate-fade-in bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 rounded-3xl mx-4 mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Welcome to ROJAR STALIN CMS
            </h2>
            <p className="text-xl text-slate-600 mb-8 font-medium">
              Track, manage, and analyze all your cheque transactions with powerful insights and real-time updates.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg" />
                <span className="font-semibold text-slate-700">Real-time tracking</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.5s' }} />
                <span className="font-semibold text-slate-700">Smart analytics</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1s' }} />
                <span className="font-semibold text-slate-700">Secure & reliable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Widgets */}
        <AnalyticsWidget outgoingCheques={outgoingCheques} incomingCheques={incomingCheques} />


        {/* Enhanced Main Tabs */}
        <Tabs defaultValue="outgoing" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-lg grid-cols-2 mx-auto h-16 bg-gradient-to-r from-white/20 to-white/10 shadow-2xl border border-white/30 backdrop-blur-md rounded-2xl">
              <TabsTrigger 
                value="outgoing" 
                className="gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/25 transition-all duration-300 hover:scale-105 rounded-xl"
              >
                <ArrowUpCircle className="h-6 w-6" />
                <span className="font-bold text-lg">Cheques Out</span>
                <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {activeOutgoing.length}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="incoming" 
                className="gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 rounded-xl"
              >
                <ArrowDownCircle className="h-6 w-6" />
                <span className="font-bold text-lg">Cheques In</span>
                <div className="bg-gradient-to-r from-emerald-400 to-green-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {activeIncoming.length}
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* OUTGOING CHEQUES */}
          <TabsContent value="outgoing" className="space-y-6 animate-slide-up">
            <div className="flex justify-end animate-bounce-in" style={{ animationDelay: '0.2s' }}>
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
                      onDelete={handleDeleteOutgoing}
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
                    <HistoryTable cheques={outgoingCheques} onDelete={handleDeleteOutgoing} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* INCOMING CHEQUES */}
          <TabsContent value="incoming" className="space-y-6 animate-slide-up">
            <div className="flex justify-end animate-bounce-in" style={{ animationDelay: '0.2s' }}>
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
                      onDelete={handleDeleteIncoming}
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
                    <IncomingHistoryTable cheques={incomingCheques} onDelete={handleDeleteIncoming} />
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
