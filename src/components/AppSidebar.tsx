import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  PlusCircle,
  LogOut,
  User,
  HelpCircle,
  Coins,
  Plus,
  Briefcase,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useUserCredits } from "@/hooks/useCredits";
import { CreditPurchaseDialog } from "./CreditPurchaseDialog";
import { getAccountStatus } from "@/lib/devAccount";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Negócios", url: "/deals", icon: Briefcase },
  { title: "Leads (Pessoas)", url: "/leads", icon: Users },
  { title: "Atividades", url: "/activities", icon: FileText },
  { title: "Automações", url: "/automations", icon: Zap },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings },
  { title: "Ajuda", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { data: credits } = useUserCredits(user?.id);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  // Get account status (dev or regular)
  const accountStatus = getAccountStatus(credits?.credits, user);
  const { credits: balance, creditsDisplay, badgeColor, tooltip, isDevAccount } = accountStatus;

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-sidebar-primary">snapdoor</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            Ações Rápidas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-sidebar-foreground hover:bg-sidebar-accent/50"
                  onClick={() => {
                    const event = new CustomEvent("openAddLead");
                    window.dispatchEvent(event);
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Adicionar Lead</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 space-y-3">
        {/* Indicador de Créditos */}
        <div className={`rounded-lg p-3 border ${
          isDevAccount 
            ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800" 
            : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-sidebar-foreground">
                {isDevAccount ? "Dev Account" : "Meus Créditos"}
              </span>
            </div>
            {!isDevAccount && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                      onClick={() => setShowPurchaseDialog(true)}
                    >
                      <Plus className="w-4 h-4 text-purple-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Comprar mais créditos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${isDevAccount ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600" : "text-purple-600"}`}>
              {creditsDisplay}
            </span>
            <span className="text-xs text-muted-foreground">
              {isDevAccount ? "ilimitados" : "créditos disponíveis"}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-fit">
                  <Badge className={`${badgeColor} border-none mt-2 text-xs cursor-help`}>
                    {isDevAccount ? "🚀 Acesso Total" : balance > 100 ? "✅ Saldo bom" : balance > 50 ? "⚠️ Saldo médio" : "🔴 Saldo baixo"}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {user?.email?.split("@")[0] || "Usuário"}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {user?.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/settings" className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      {/* Dialog de Compra de Créditos */}
      <CreditPurchaseDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
      />
    </Sidebar>
  );
}
