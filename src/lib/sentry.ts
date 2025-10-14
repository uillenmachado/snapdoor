import * as Sentry from '@sentry/react';

/**
 * Inicializa o Sentry para monitoramento de erros em produção
 * 
 * Features:
 * - Error tracking automático
 * - Performance monitoring
 * - Session replay
 * - Breadcrumbs de navegação
 * - Contexto de usuário
 * 
 * @see https://docs.sentry.io/platforms/javascript/guides/react/
 */
export function initSentry() {
  // Só inicializa em produção ou se VITE_SENTRY_DSN estiver configurado
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  if (!dsn) {
    console.log('[Sentry] DSN não configurado - monitoramento desabilitado');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    
    // Configurações de integração
    integrations: [
      // Browser Tracing para performance
      Sentry.browserTracingIntegration(),
      
      // Session Replay para debugging visual
      Sentry.replayIntegration({
        maskAllText: true, // Proteger informações sensíveis
        blockAllMedia: true, // Não gravar imagens/vídeos
      }),
      
      // HTTP Client errors
      Sentry.httpClientIntegration(),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% em produção, 100% em dev
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% das sessões
    replaysOnErrorSampleRate: 1.0, // 100% quando houver erro

    // Ignorar erros conhecidos/irrelevantes
    ignoreErrors: [
      // Erros de rede comuns
      'Network request failed',
      'NetworkError',
      'Failed to fetch',
      
      // Erros de browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      
      // Erros de cancelamento (esperados)
      'AbortError',
      'The user aborted a request',
      
      // Erros de ResizeObserver (safe to ignore)
      'ResizeObserver loop limit exceeded',
    ],

    // Beforehand para adicionar contexto
    beforeSend(event, hint) {
      // Filtrar informações sensíveis
      if (event.request) {
        // Remover tokens de autenticação dos headers
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }
        
        // Remover query params sensíveis
        if (event.request.url) {
          const url = new URL(event.request.url);
          url.searchParams.delete('token');
          url.searchParams.delete('key');
          url.searchParams.delete('password');
          event.request.url = url.toString();
        }
      }

      // Adicionar contexto adicional
      if (hint.originalException) {
        console.error('[Sentry] Capturando erro:', hint.originalException);
      }

      return event;
    },

    // Breadcrumbs personalizados
    beforeBreadcrumb(breadcrumb) {
      // Não logar cliques em elementos sensíveis
      if (breadcrumb.category === 'ui.click') {
        const target = breadcrumb.message?.toLowerCase() || '';
        if (target.includes('password') || target.includes('token')) {
          return null;
        }
      }
      return breadcrumb;
    },
  });

  console.log(`[Sentry] Inicializado em ambiente: ${environment}`);
}

/**
 * Define o usuário atual no contexto do Sentry
 */
export function setSentryUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Remove o usuário do contexto (útil no logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Adiciona contexto customizado a um erro
 */
export function setSentryContext(key: string, value: Record<string, any>) {
  Sentry.setContext(key, value);
}

/**
 * Adiciona tag para filtrar erros
 */
export function setSentryTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Captura erro manualmente
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setContext('additional', context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Captura mensagem (não erro, mas evento importante)
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Inicia span de performance (versão atualizada do Sentry v8+)
 */
export function startSpan<T>(
  context: { name: string; op: string },
  callback: () => T
): T {
  return Sentry.startSpan(context, callback);
}

// Re-exportar Sentry para uso direto quando necessário
export { Sentry };
