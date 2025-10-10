// =====================================================
// DEV ACCOUNT UTILITIES
// Funções para verificar e exibir status de conta dev
// =====================================================

import { User } from "@supabase/supabase-js";

/**
 * Email da conta de desenvolvedor/proprietário
 */
export const DEV_ACCOUNT_EMAIL = "uillenmachado@gmail.com";

/**
 * Valor de créditos ilimitados para conta dev
 */
export const UNLIMITED_CREDITS = 999999;

/**
 * Verifica se um usuário é a conta dev
 */
export const isDevAccount = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return user.email === DEV_ACCOUNT_EMAIL;
};

/**
 * Verifica se um email é da conta dev
 */
export const isDevEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return email === DEV_ACCOUNT_EMAIL;
};

/**
 * Retorna o display de créditos (formatado)
 * Para conta dev: "∞ DEV"
 * Para outras contas: número normal
 */
export const getCreditsDisplay = (
  credits: number | undefined,
  user: User | null | undefined
): string => {
  if (isDevAccount(user)) {
    return "∞ DEV";
  }
  return credits?.toString() || "0";
};

/**
 * Retorna a cor do badge de créditos
 * Para conta dev: gradiente roxo/rosa
 * Para outras contas: verde/amarelo/vermelho baseado na quantidade
 */
export const getCreditsBadgeColor = (
  credits: number | undefined,
  user: User | null | undefined
): string => {
  if (isDevAccount(user)) {
    return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
  }

  const amount = credits || 0;
  
  if (amount > 100) {
    return "bg-green-500 text-white";
  } else if (amount >= 50) {
    return "bg-yellow-500 text-black";
  } else {
    return "bg-red-500 text-white";
  }
};

/**
 * Retorna mensagem tooltip para o badge de créditos
 */
export const getCreditsTooltip = (
  credits: number | undefined,
  user: User | null | undefined
): string => {
  if (isDevAccount(user)) {
    return "Conta de Desenvolvedor - Créditos Ilimitados para Testes";
  }

  const amount = credits || 0;
  return `Você tem ${amount} créditos disponíveis`;
};

/**
 * Verifica se usuário tem créditos suficientes
 * Conta dev sempre retorna true
 */
export const hasEnoughCredits = (
  requiredCredits: number,
  currentCredits: number | undefined,
  user: User | null | undefined
): boolean => {
  if (isDevAccount(user)) {
    return true; // Dev account sempre tem créditos suficientes
  }

  return (currentCredits || 0) >= requiredCredits;
};

/**
 * Retorna mensagem de créditos insuficientes
 */
export const getInsufficientCreditsMessage = (
  required: number,
  current: number | undefined,
  user: User | null | undefined
): string => {
  if (isDevAccount(user)) {
    return ""; // Não deve acontecer para conta dev
  }

  const currentAmount = current || 0;
  const deficit = required - currentAmount;

  return `Você precisa de ${required} créditos, mas tem apenas ${currentAmount}. Faltam ${deficit} créditos.`;
};

/**
 * Tipo para status de conta
 */
export interface AccountStatus {
  isDevAccount: boolean;
  credits: number;
  creditsDisplay: string;
  badgeColor: string;
  tooltip: string;
  hasUnlimitedAccess: boolean;
}

/**
 * Retorna status completo da conta
 */
export const getAccountStatus = (
  credits: number | undefined,
  user: User | null | undefined
): AccountStatus => {
  const isDev = isDevAccount(user);
  const creditAmount = isDev ? UNLIMITED_CREDITS : (credits || 0);

  return {
    isDevAccount: isDev,
    credits: creditAmount,
    creditsDisplay: getCreditsDisplay(credits, user),
    badgeColor: getCreditsBadgeColor(credits, user),
    tooltip: getCreditsTooltip(credits, user),
    hasUnlimitedAccess: isDev,
  };
};
