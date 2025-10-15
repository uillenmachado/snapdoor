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
  Activity,
  GitBranch,
  Building2,
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
  { title: "Pipelines", url: "/pipelines", icon: GitBranch },
  { title: "Negócios", url: "/deals", icon: Briefcase },
  { title: "Leads", url: "/leads", icon: Users },
  { title: "Empresas", url: "/companies", icon: Building2 },
  { title: "Atividades", url: "/activities", icon: FileText },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Scraper Logs", url: "/scraper-logs", icon: Activity },
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
    <Sidebar className="border-r border-neutral-200 dark:border-neutral-800">
      <SidebarHeader className="border-b border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-brand-green-500 to-brand-green-600 bg-clip-text text-transparent">
            snapdoor
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-3 mb-2">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="transition-all duration-200">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-brand-green-50 dark:bg-brand-green-900/20 text-brand-green-700 dark:text-brand-green-400 font-medium border-l-2 border-brand-green-500"
                          : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-l-2 border-transparent"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-3 mb-2">
            Ações Rápidas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all duration-200"
                  onClick={() => {
                    const event = new CustomEvent("openAddLead");
                    window.dispatchEvent(event);
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="text-sm">Adicionar Lead</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        {/* Indicador de Créditos */}
        <div className={`rounded-lg p-3 border shadow-sm ${
          isDevAccount 
            ? "bg-gradient-to-br from-brand-purple-50 to-pink-50 dark:from-brand-purple-900/20 dark:to-pink-900/20 border-brand-purple-200 dark:border-brand-purple-800" 
            : "bg-gradient-to-br from-brand-purple-50 to-pink-50 dark:from-brand-purple-900/20 dark:to-pink-900/20 border-brand-purple-200 dark:border-brand-purple-800"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand-purple-600 dark:text-brand-purple-400" />
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
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
                      className="h-6 w-6 p-0 hover:bg-brand-purple-100 dark:hover:bg-brand-purple-900/20"
                      onClick={() => setShowPurchaseDialog(true)}
                    >
                      <Plus className="w-3 h-3 text-brand-purple-600 dark:text-brand-purple-400" />
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
            <span className={`text-2xl font-bold ${isDevAccount ? "text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-600 to-pink-600" : "text-brand-purple-600 dark:text-brand-purple-400"}`}>
              {creditsDisplay}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {isDevAccount ? "ilimitados" : "disponíveis"}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-fit">
                  <Badge className={`${badgeColor} border-none mt-2 text-xs cursor-help shadow-sm`}>
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
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-neutral-200 dark:border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-green-100 to-brand-green-200 dark:from-brand-green-900/40 dark:to-brand-green-800/40 flex items-center justify-center ring-2 ring-brand-green-500/20">
                <User className="h-4 w-4 text-brand-green-700 dark:text-brand-green-400" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate">
                  {user?.email?.split("@")[0] || "Usuário"}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
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
