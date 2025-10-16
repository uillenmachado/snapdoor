import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Calendar, MoreVertical, TrendingUp, Users, Star, Copy, Edit, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Deal } from "@/hooks/useDeals";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DealCardProps {
  deal: Deal;
  onEdit?: (deal: Deal) => void;
  onDelete?: (dealId: string) => void;
  onMarkAsWon?: (dealId: string) => void;
  onMarkAsLost?: (dealId: string) => void;
  onDuplicate?: (deal: Deal) => void;
  onToggleFavorite?: (dealId: string) => void;
  onClick?: (deal: Deal) => void;
}

export const DealCard = memo(function DealCard({
  deal,
  onEdit,
  onDelete,
  onMarkAsWon,
  onMarkAsLost,
  onDuplicate,
  onToggleFavorite,
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
      className="bg-card border-border hover:shadow-lg hover:border-accent transition-all duration-200 cursor-pointer group"
      onClick={() => onClick?.(deal)}
    >
      <CardHeader className="pb-3 pt-3.5 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {deal.is_favorite && (
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500 flex-shrink-0" />
              )}
              <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {deal.title}
              </h3>
            </div>
            {deal.company_name && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate font-medium">
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
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
              >
                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Favoritar */}
              {onToggleFavorite && (
                <>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(deal.id);
                    }}
                    className="cursor-pointer"
                  >
                    <Star className={`h-4 w-4 mr-2 ${deal.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    {deal.is_favorite ? 'Remover dos favoritos' : 'Favoritar'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Editar */}
              {onEdit && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(deal);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}

              {/* Duplicar */}
              {onDuplicate && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(deal);
                  }}
                  className="cursor-pointer"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar oportunidade
                </DropdownMenuItem>
              )}

              {deal.status === 'open' && (
                <DropdownMenuSeparator />
              )}

              {/* Marcar como Ganho */}
              {onMarkAsWon && deal.status === 'open' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsWon(deal.id);
                  }}
                  className="cursor-pointer text-green-600 dark:text-green-500 focus:text-green-700 dark:focus:text-green-400"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Ganho
                </DropdownMenuItem>
              )}

              {/* Marcar como Perdido */}
              {onMarkAsLost && deal.status === 'open' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsLost(deal.id);
                  }}
                  className="cursor-pointer text-orange-600 dark:text-orange-500 focus:text-orange-700 dark:focus:text-orange-400"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Marcar como Perdido
                </DropdownMenuItem>
              )}

              {(onEdit || onDuplicate || onMarkAsWon || onMarkAsLost) && onDelete && (
                <DropdownMenuSeparator />
              )}

              {/* Excluir */}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Tem certeza que deseja excluir "${deal.title}"?`)) {
                      onDelete(deal.id);
                    }
                  }}
                  className="cursor-pointer text-red-600 dark:text-red-500 focus:text-red-700 dark:focus:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
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
            <span className="text-lg font-bold text-primary">
              {formatCurrency(deal.value)}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Probabilidade */}
        {deal.status === 'open' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Probabilidade</span>
                  <span className={`font-semibold px-2 py-0.5 rounded ${getProbabilityColor(deal.probability)}`}>
                    {deal.probability}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-medium">
              Previsão: {format(new Date(deal.expected_close_date), "dd MMM yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Participantes (placeholder - será implementado quando integrarmos) */}
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex -space-x-2">
            {/* Aqui vamos renderizar os avatares dos participantes */}
            <Avatar className="h-6 w-6 border-2 border-card">
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                +
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {deal.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-accent text-foreground border-0">
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-accent text-foreground border-0">
                +{deal.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
