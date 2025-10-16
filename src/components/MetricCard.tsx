/**
 * MetricCard - Componente de card de métrica padronizado
 * 
 * Exibe uma métrica com:
 * - Título
 * - Valor (grande e destacado)
 * - Descrição/contexto opcional
 * - Ícone opcional
 * - Variantes de cor
 * 
 * Uso:
 * <MetricCard
 *   title="Total de Leads"
 *   value={1234}
 *   description="+12% vs último mês"
 *   icon={<Users />}
 *   variant="default"
 * />
 */

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantStyles = {
  default: {
    border: "border-border",
    value: "text-foreground",
  },
  success: {
    border: "border-green-200 dark:border-green-800",
    value: "text-green-600 dark:text-green-500",
  },
  warning: {
    border: "border-yellow-200 dark:border-yellow-800",
    value: "text-yellow-600 dark:text-yellow-500",
  },
  danger: {
    border: "border-red-200 dark:border-red-800",
    value: "text-red-600 dark:text-red-500",
  },
  info: {
    border: "border-blue-200 dark:border-blue-800",
    value: "text-blue-600 dark:text-blue-500",
  },
};

export function MetricCard({
  title,
  value,
  description,
  icon,
  variant = "default",
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn("bg-card hover:shadow-md transition-shadow", styles.border, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", styles.value)}>
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
