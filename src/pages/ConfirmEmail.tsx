import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Verificar se há hash na URL (token de confirmação)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && type === 'signup') {
        try {
          // Supabase já processou o token automaticamente
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user?.email_confirmed_at) {
            setStatus('success');
            setMessage('Email confirmado com sucesso!');
            toast.success('Email confirmado! Redirecionando...');
            
            // Redirecionar para dashboard após 2 segundos
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Erro ao confirmar email. Tente novamente.');
          }
        } catch (error) {
          console.error('Error confirming email:', error);
          setStatus('error');
          setMessage('Erro ao confirmar email. Tente novamente.');
        }
      } else {
        // Não há token na URL - mostrar instruções
        setStatus('pending');
        setMessage('Aguardando confirmação de email');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  const handleResendEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error('Usuário não encontrado');
        return;
      }

      // Resend confirmation email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;
      
      toast.success('Email de confirmação reenviado!');
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('Erro ao reenviar email');
    }
  };

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
            {status === 'pending' && (
              <Mail className="h-16 w-16 text-primary" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirmando email...'}
            {status === 'success' && 'Email confirmado!'}
            {status === 'error' && 'Erro na confirmação'}
            {status === 'pending' && 'Confirme seu email'}
          </CardTitle>
          
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'pending' && (
            <>
              <div className="text-sm text-muted-foreground text-center space-y-2">
                <p>
                  Enviamos um email de confirmação para o endereço cadastrado.
                </p>
                <p>
                  Por favor, verifique sua caixa de entrada e clique no link de confirmação.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Não recebeu o email? Verifique a pasta de spam ou lixo eletrônico.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  Reenviar email de confirmação
                </Button>
                
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className="w-full"
                >
                  Voltar ao login
                </Button>
              </div>
            </>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Você será redirecionado automaticamente para o dashboard...
              </p>
              
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Ir para o Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleResendEmail}
                className="w-full"
              >
                Tentar novamente
              </Button>
              
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
              >
                Voltar ao login
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Aguarde enquanto verificamos seu email...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
