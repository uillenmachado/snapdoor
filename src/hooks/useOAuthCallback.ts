import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook para salvar tokens OAuth2 do Google após autenticação
 * 
 * Este hook monitora mudanças na sessão e automaticamente salva
 * os tokens OAuth2 na tabela email_integrations quando o usuário
 * faz login via Google OAuth.
 */
export const useOAuthCallback = () => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Apenas processa quando há um login via OAuth
        if (event === "SIGNED_IN" && session) {
          const { provider_token, provider_refresh_token } = session;
          const user = session.user;

          // Verifica se é login via Google com tokens OAuth
          if (
            user.app_metadata.provider === "google" &&
            provider_token &&
            provider_refresh_token
          ) {
            try {
              // Verifica se já existe uma integração Gmail ativa
              const { data: existingIntegration } = await supabase
                .from("email_integrations")
                .select("*")
                .eq("user_id", user.id)
                .eq("provider", "gmail")
                .maybeSingle();

              if (existingIntegration) {
                // Atualiza tokens existentes
                const { error } = await supabase
                  .from("email_integrations")
                  .update({
                    access_token: provider_token,
                    refresh_token: provider_refresh_token,
                    token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hora
                    is_active: true,
                    is_verified: true,
                    oauth_scopes: [
                      "https://www.googleapis.com/auth/gmail.send",
                      "https://www.googleapis.com/auth/gmail.readonly",
                    ],
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existingIntegration.id);

                if (error) {
                  console.error("Erro ao atualizar integração Gmail:", error);
                  toast.error("Erro ao atualizar conexão com Gmail");
                } else {
                  console.log("✅ Tokens Gmail atualizados com sucesso");
                  toast.success("Gmail conectado com sucesso!");
                }
              } else {
                // Cria nova integração
                const { error } = await supabase
                  .from("email_integrations")
                  .insert({
                    user_id: user.id,
                    provider: "gmail",
                    email: user.email!,
                    access_token: provider_token,
                    refresh_token: provider_refresh_token,
                    token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hora
                    is_active: true,
                    is_verified: true,
                    oauth_scopes: [
                      "https://www.googleapis.com/auth/gmail.send",
                      "https://www.googleapis.com/auth/gmail.readonly",
                    ],
                  });

                if (error) {
                  console.error("Erro ao criar integração Gmail:", error);
                  toast.error("Erro ao conectar Gmail");
                } else {
                  console.log("✅ Integração Gmail criada com sucesso");
                  toast.success("Gmail conectado com sucesso! Agora você pode enviar emails.");
                }
              }
            } catch (error) {
              console.error("Erro ao processar tokens OAuth:", error);
              toast.error("Erro ao processar autenticação do Gmail");
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
};
