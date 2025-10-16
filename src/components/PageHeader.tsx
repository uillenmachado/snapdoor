/**
 * PageHeader - Componente de header padronizado para todas as páginas
 * 
 * Estrutura consistente com:
 * - SidebarTrigger
 * - Título da página (H1)
 * - Descrição da página
 * - Ações rápidas (botões, notificações, etc)
 * 
 * Uso:
 * <PageHeader
 *   title="Título da Página"
 *   description="Descrição ou contexto"
 *   actions={<Button>Ação</Button>}
 * />
 */

import { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/NotificationBell";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  showNotifications?: boolean;
}

export function PageHeader({ 
  title, 
  description, 
  actions,
  showNotifications = true 
}: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showNotifications && <NotificationBell />}
          {actions}
        </div>
      </div>
    </header>
  );
}
