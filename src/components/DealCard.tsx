import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Calendar, MoreVertical, TrendingUp, Users } from "lucide-react";
import { Deal } from "@/hooks/useDeals";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DealCardProps {
  deal: Deal;
  onEdit?: (deal: Deal) => void;
  onDelete?: (dealId: string) => void;
  onMarkAsWon?: (dealId: string) => void;
  onMarkAsLost?: (dealId: string) => void;
  onClick?: (deal: Deal) => void;
}

export const DealCard = memo(function DealCard({
  deal,
  onEdit,
  onDelete,
  onMarkAsWon,
  onMarkAsLost,
  onClick,
}: DealCardProps) {
  // Formatar valor em moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: deal.currency || 'BRL',
    }).format(value);
  };

  // Cor baseada na probabilidade
  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return "text-green-600 bg-green-50";
    if (probability >= 50) return "text-yellow-600 bg-yellow-50";
    if (probability >= 25) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  // Status badge
  const getStatusBadge = () => {
    switch (deal.status) {
      case 'won':
        return <Badge className="bg-green-500">Ganho 🎉</Badge>;
      case 'lost':
        return <Badge variant="destructive">Perdido</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onClick?.(deal)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {deal.title}
            </h3>
            {deal.company_name && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{deal.company_name}</span>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(deal);
                }}>
                  Editar
                </DropdownMenuItem>
              )}
              {onMarkAsWon && deal.status === 'open' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsWon(deal.id);
                  }}
                  className="text-green-600"
                >
                  Marcar como Ganho
                </DropdownMenuItem>
              )}
              {onMarkAsLost && deal.status === 'open' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsLost(deal.id);
                  }}
                  className="text-red-600"
                >
                  Marcar como Perdido
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(deal.id);
                  }}
                  className="text-destructive"
                >
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Valor e Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(deal.value)}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Probabilidade */}
        {deal.status === 'open' && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Probabilidade</span>
                <span className={`font-medium ${getProbabilityColor(deal.probability)}`}>
                  {deal.probability}%
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProbabilityColor(deal.probability)} transition-all`}
                  style={{ width: `${deal.probability}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Data prevista de fechamento */}
        {deal.expected_close_date && deal.status === 'open' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Previsão: {format(new Date(deal.expected_close_date), "dd MMM yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Participantes (placeholder - será implementado quando integrarmos) */}
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex -space-x-2">
            {/* Aqui vamos renderizar os avatares dos participantes */}
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarFallback className="text-xs">+</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deal.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{deal.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
