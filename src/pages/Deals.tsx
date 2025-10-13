import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, TrendingUp, DollarSign, Target, Award } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DealKanbanBoard } from "@/components/deals/DealKanbanBoard";
import { usePipeline, useStages } from "@/hooks/usePipelines";
import { useDeals, useMoveDeal } from "@/hooks/useDeals";
import { formatCurrency, calculateTotalValue, calculateWeightedValue } from "@/types/deal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Deals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline(user?.id);
  const { data: stages, isLoading: stagesLoading } = useStages(pipeline?.id);
  const { data: allDeals, isLoading: dealsLoading } = useDeals(user?.id);
  const moveDeal = useMoveDeal();
  const isLoading = pipelineLoading || stagesLoading || dealsLoading;
  
  const deals = useMemo(() => {
    if (!allDeals) return [];
    return allDeals.filter((deal) => {
      if (deal.status !== "open") return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return deal.title?.toLowerCase().includes(search) || deal.company_name?.toLowerCase().includes(search);
      }
      return true;
    });
  }, [allDeals, searchTerm]);
  
  const stagesWithDeals = useMemo(() => {
    if (!stages) return [];
    return stages.map((stage) => ({ ...stage, deals: deals.filter((deal) => deal.stage_id === stage.id) }));
  }, [stages, deals]);
  
  const handleDealMove = async (dealId: string, newStageId: string, newPosition: number) => {
    try {
      await moveDeal.mutateAsync({ dealId, newStageId, newPosition });
      toast({ title: "Negócio movido", description: "O negócio foi movido com sucesso." });
    } catch (error) {
      toast({ title: "Erro ao mover negócio", variant: "destructive" });
    }
  };
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold">Negócios</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : stagesWithDeals.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12">
              <Target className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum estágio encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Você ainda não possui estágios configurados.
              </p>
            </Card>
          ) : (
            <DealKanbanBoard
              stages={stagesWithDeals}
              onDealMove={handleDealMove}
              onDealClick={(id) => navigate(/deals/)}
              onDealEdit={(id) => toast({ title: "Em desenvolvimento" })}
              onDealDelete={(id) => toast({ title: "Em desenvolvimento" })}
              onStageEdit={(id) => toast({ title: "Em desenvolvimento" })}
              onStageDelete={(id) => toast({ title: "Em desenvolvimento" })}
              onAddDeal={(id) => toast({ title: "Em desenvolvimento" })}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
