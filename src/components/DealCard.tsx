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
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 cursor-pointer group"
      onClick={() => onClick?.(deal)}
    >
      <CardHeader className="pb-3 pt-3.5 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2 group-hover:text-brand-green-600 dark:group-hover:text-brand-green-400 transition-colors">
              {deal.title}
            </h3>
            {deal.company_name && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Building2 className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate font-medium">
                  {deal.company_name}
                </span>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <MoreVertical className="h-3.5 w-3.5 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
                  className="text-success-600 focus:text-success-700"
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
                  className="text-danger-600 focus:text-danger-700"
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
                  className="text-danger-600 focus:text-danger-700"
                >
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4">
        {/* Valor e Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-brand-green-600 dark:text-brand-green-500">
              {formatCurrency(deal.value)}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Probabilidade */}
        {deal.status === 'open' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">Probabilidade</span>
                  <span className={`font-semibold px-2 py-0.5 rounded ${getProbabilityColor(deal.probability)}`}>
                    {deal.probability}%
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      deal.probability >= 75 ? 'bg-success-500' :
                      deal.probability >= 50 ? 'bg-warning-500' :
                      deal.probability >= 25 ? 'bg-warning-600' :
                      'bg-danger-500'
                    }`}
                    style={{ width: `${deal.probability}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data prevista de fechamento */}
        {deal.expected_close_date && deal.status === 'open' && (
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <Calendar className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            <span className="font-medium">
              Previsão: {format(new Date(deal.expected_close_date), "dd MMM yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Participantes (placeholder - será implementado quando integrarmos) */}
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
          <div className="flex -space-x-2">
            {/* Aqui vamos renderizar os avatares dos participantes */}
            <Avatar className="h-6 w-6 border-2 border-white dark:border-neutral-900">
              <AvatarFallback className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                +
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {deal.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0">
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0">
                +{deal.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
