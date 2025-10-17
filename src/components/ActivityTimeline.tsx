/**
 * ActivityTimeline - Timeline de atividades (emails, ligações, notas)
 * Exibe histórico completo de interações com a oportunidade
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail,
  Phone,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MailOpen,
  MousePointerClick,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: string;
  direction?: string;
  data: any;
  status: string;
  opened_at?: string | null;
  opened_count?: number;
  clicked_at?: string | null;
  clicked_count?: number;
  created_at: string;
  completed_at?: string | null;
}

interface ActivityTimelineProps {
  dealId: string;
  className?: string;
}

export function ActivityTimeline({ dealId, className }: ActivityTimelineProps) {
  // Buscar atividades do deal  
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['deal-activities', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar atividades:', error);
        throw error;
      }
      return (data || []) as any as Activity[];
    },
    refetchInterval: 10000, // Atualizar a cada 10s para pegar novos opens/clicks
  });

  // Renderizar ícone por tipo de atividade
  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      email: Mail,
      call: Phone,
      note: FileText,
      meeting: Calendar,
      task: CheckCircle2,
    };

    const Icon = icons[type] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  // Cor por tipo
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      email: 'text-blue-600 dark:text-blue-400',
      call: 'text-green-600 dark:text-green-400',
      note: 'text-gray-600 dark:text-gray-400',
      meeting: 'text-purple-600 dark:text-purple-400',
      task: 'text-orange-600 dark:text-orange-400',
    };

    return colors[type] || 'text-gray-600';
  };

  // Renderizar card de atividade
  const renderActivity = (activity: Activity) => {
    const isEmail = activity.type === 'email';
    const isOutbound = activity.direction === 'outbound';

    return (
      <Card key={activity.id} className="relative">
        {/* Linha conectora */}
        {activities.indexOf(activity) !== activities.length - 1 && (
          <div className="absolute left-6 top-12 w-0.5 h-full bg-border -z-10" />
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Ícone */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background',
                  getTypeColor(activity.type)
                )}
              >
                {getActivityIcon(activity.type)}
              </div>

              {/* Título e metadata */}
              <div>
                <h4 className="font-medium">
                  {isEmail && activity.data.subject}
                  {activity.type === 'call' && 'Ligação telefônica'}
                  {activity.type === 'note' && 'Nota adicionada'}
                  {activity.type === 'meeting' && 'Reunião'}
                </h4>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  {/* Direção */}
                  {isEmail && (
                    <Badge variant={isOutbound ? 'default' : 'secondary'} className="text-xs">
                      {isOutbound ? 'Enviado' : 'Recebido'}
                    </Badge>
                  )}

                  {/* Para/De */}
                  {isEmail && activity.data.to && (
                    <span className="text-xs">
                      Para: {Array.isArray(activity.data.to) ? activity.data.to.join(', ') : activity.data.to}
                    </span>
                  )}

                  {/* Timestamp */}
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Status badges (para emails) */}
            {isEmail && isOutbound && (
              <div className="flex items-center gap-2">
                {/* Email aberto */}
                {activity.opened_at && (
                  <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                    <MailOpen className="h-3 w-3" />
                    Aberto {activity.opened_count && activity.opened_count > 1 ? `(${activity.opened_count}x)` : ''}
                  </Badge>
                )}

                {/* Link clicado */}
                {activity.clicked_at && (
                  <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                    <MousePointerClick className="h-3 w-3" />
                    Clicado {activity.clicked_count && activity.clicked_count > 1 ? `(${activity.clicked_count}x)` : ''}
                  </Badge>
                )}

                {/* Ainda não aberto */}
                {!activity.opened_at && activity.status === 'sent' && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Aguardando leitura
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Corpo do email (preview) */}
          {isEmail && activity.data.body_text && (
            <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
              {activity.data.body_text}
            </p>
          )}

          {/* Notas de ligação */}
          {activity.type === 'call' && activity.data.notes && (
            <p className="text-sm text-muted-foreground">{activity.data.notes}</p>
          )}

          {/* Conteúdo da nota */}
          {activity.type === 'note' && activity.data.content && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{activity.data.content}</p>
          )}

          {/* Metadata adicional */}
          {isEmail && activity.opened_at && (
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
              {activity.opened_at && (
                <div className="flex items-center gap-2">
                  <MailOpen className="h-3 w-3" />
                  Aberto pela primeira vez: {formatDistanceToNow(new Date(activity.opened_at), { addSuffix: true, locale: ptBR })}
                </div>
              )}
              {activity.clicked_at && (
                <div className="flex items-center gap-2">
                  <MousePointerClick className="h-3 w-3" />
                  Primeiro clique: {formatDistanceToNow(new Date(activity.clicked_at), { addSuffix: true, locale: ptBR })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-12 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Nenhuma atividade registrada</h3>
          <p className="text-sm text-muted-foreground">
            Envie um email, faça uma ligação ou adicione uma nota para começar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {activities.map(renderActivity)}
    </div>
  );
}
