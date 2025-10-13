/**
 * Componente de Timeline/Feed de Atividades
 * Exibe histórico cronológico de atividades do CRM
 */

import { Activity, getActivityConfig, formatRelativeTime, formatActivityDate } from "@/types/activity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Trophy,
  XCircle,
  UserPlus,
  UserCheck,
  Building2,
  Building,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map de ícones
const ICON_MAP = {
  FileText,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Trophy,
  XCircle,
  UserPlus,
  UserCheck,
  Building2,
  Building,
};

interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  onActivityEdit?: (activity: Activity) => void;
  onActivityDelete?: (activityId: string) => void;
  showRelated?: boolean;
  compact?: boolean;
}

export function ActivityFeed({
  activities,
  onActivityClick,
  onActivityEdit,
  onActivityDelete,
  showRelated = true,
  compact = false,
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma atividade</h3>
        <p className="text-muted-foreground text-center">
          As atividades aparecerão aqui conforme você interage com o sistema.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          isLast={index === activities.length - 1}
          onClick={onActivityClick}
          onEdit={onActivityEdit}
          onDelete={onActivityDelete}
          showRelated={showRelated}
          compact={compact}
        />
      ))}
    </div>
  );
}

interface ActivityItemProps {
  activity: Activity;
  isLast: boolean;
  onClick?: (activity: Activity) => void;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  showRelated: boolean;
  compact: boolean;
}

function ActivityItem({
  activity,
  isLast,
  onClick,
  onEdit,
  onDelete,
  showRelated,
  compact,
}: ActivityItemProps) {
  const config = getActivityConfig(activity.type);
  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];

  const handleClick = () => {
    if (onClick) {
      onClick(activity);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(activity);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(activity.id);
    }
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-10 bottom-0 w-px bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          config.bgColor
        )}
      >
        {IconComponent && (
          <IconComponent className={cn("h-4 w-4", config.color)} />
        )}
      </div>

      {/* Content */}
      <Card
        className={cn(
          "flex-1 p-4 hover:shadow-md transition-shadow",
          onClick && "cursor-pointer"
        )}
        onClick={handleClick}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{activity.title}</h4>
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
              {activity.status && (
                <Badge
                  variant={
                    activity.status === "completed"
                      ? "default"
                      : activity.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {activity.status === "completed"
                    ? "Concluído"
                    : activity.status === "pending"
                    ? "Pendente"
                    : "Cancelado"}
                </Badge>
              )}
            </div>

            {/* Description */}
            {activity.description && !compact && (
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
            )}

            {/* Related entities */}
            {showRelated && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {activity.lead_name && (
                  <div className="flex items-center gap-1">
                    <UserPlus className="h-3 w-3" />
                    <span>{activity.lead_name}</span>
                  </div>
                )}
                {activity.company_name && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span>{activity.company_name}</span>
                  </div>
                )}
                {activity.deal_title && (
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>{activity.deal_title}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2">
              {activity.user_avatar && (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={activity.user_avatar} />
                  <AvatarFallback className="text-xs">
                    {activity.user_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-xs text-muted-foreground">
                {activity.user_name || "Usuário"} •{" "}
                <span title={formatActivityDate(activity.created_at)}>
                  {formatRelativeTime(activity.created_at)}
                </span>
              </span>
            </div>
          </div>

          {/* Actions */}
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>
    </div>
  );
}
