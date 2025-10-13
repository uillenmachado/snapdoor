/**
 * Card de Deal para Kanban Board
 * Exibe informações do deal com drag & drop
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Calendar,
  DollarSign,
  GripVertical,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Deal, formatCurrency } from '@/types/deal';
import { cn } from '@/lib/utils';

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DealCard({ deal, onClick, onEdit, onDelete }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600 bg-green-50';
    if (probability >= 50) return 'text-blue-600 bg-blue-50';
    if (probability >= 25) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'mb-3 cursor-pointer hover:shadow-md transition-all',
        isDragging && 'opacity-50 rotate-2 scale-105'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header com Título e Ações */}
        <div className="flex items-start gap-2 mb-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm line-clamp-2 mb-1">
              {deal.title}
            </h4>
            {deal.company_name && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3" />
                <span className="truncate">{deal.company_name}</span>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Valor */}
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-bold text-green-600">
            {formatCurrency(deal.value, deal.currency)}
          </span>
        </div>

        {/* Probabilidade */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Probabilidade</span>
          </div>
          <Badge variant="secondary" className={cn('text-xs', getProbabilityColor(deal.probability))}>
            {deal.probability}%
          </Badge>
        </div>

        {/* Data de Fechamento Esperada */}
        {deal.expected_close_date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(deal.expected_close_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>
        )}

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {deal.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{deal.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Avatar do Responsável (se houver) */}
        {deal.owner_id && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-xs">
                {getInitials(deal.company_name || 'U')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">Responsável</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
