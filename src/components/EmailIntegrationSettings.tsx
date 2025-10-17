/**
 * EmailIntegrationSettings - Gerenciamento de integrações de email
 * Permite conectar Gmail, Outlook, SMTP customizado
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface EmailIntegration {
  id: string;
  user_id: string;
  provider: 'resend' | 'gmail' | 'outlook' | 'smtp';
  email: string;
  is_verified: boolean;
  is_active: boolean;
  api_key?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  created_at: string;
}

export function EmailIntegrationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form states
  const [provider, setProvider] = useState<'resend' | 'gmail' | 'outlook' | 'smtp'>('resend');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  // Buscar integrações do usuário
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['email-integrations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('email_integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailIntegration[];
    },
    enabled: !!user?.id,
  });

  // Mutation para adicionar integração
  const addIntegrationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const integrationData: any = {
        user_id: user.id,
        provider,
        email,
        is_verified: false,
        is_active: true,
      };

      if (provider === 'resend') {
        integrationData.api_key = apiKey;
      } else if (provider === 'smtp') {
        integrationData.smtp_host = smtpHost;
        integrationData.smtp_port = parseInt(smtpPort);
        integrationData.smtp_username = smtpUsername;
        integrationData.smtp_password = smtpPassword;
      }

      const { data, error } = await supabase
        .from('email_integrations')
        .insert(integrationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Integração adicionada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['email-integrations'] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar integração: ${error.message}`);
    },
  });

  // Mutation para remover integração
  const removeIntegrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Integração removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['email-integrations'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover integração: ${error.message}`);
    },
  });

  // Mutation para ativar/desativar integração
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Desativar todas as outras se estiver ativando esta
      if (isActive) {
        await supabase
          .from('email_integrations')
          .update({ is_active: false })
          .eq('user_id', user?.id);
      }

      const { error } = await supabase
        .from('email_integrations')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Integração atualizada!');
      queryClient.invalidateQueries({ queryKey: ['email-integrations'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar integração: ${error.message}`);
    },
  });

  const resetForm = () => {
    setProvider('resend');
    setEmail('');
    setApiKey('');
    setSmtpHost('');
    setSmtpPort('587');
    setSmtpUsername('');
    setSmtpPassword('');
  };

  const getProviderIcon = (providerType: string) => {
    return <Mail className="h-4 w-4" />;
  };

  const getProviderName = (providerType: string) => {
    const names: Record<string, string> = {
      resend: 'Resend',
      gmail: 'Gmail',
      outlook: 'Outlook',
      smtp: 'SMTP Customizado',
    };
    return names[providerType] || providerType;
  };

  const activeIntegration = integrations.find(i => i.is_active);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Integração de Email
              </CardTitle>
              <CardDescription className="mt-2">
                Conecte sua conta de email para enviar mensagens diretamente do CRM
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Integração de Email</DialogTitle>
                  <DialogDescription>
                    Configure uma conta de email para enviar mensagens através do CRM
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Provedor */}
                  <div className="space-y-2">
                    <Label>Provedor de Email</Label>
                    <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resend">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Resend (Recomendado)
                          </div>
                        </SelectItem>
                        <SelectItem value="smtp">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            SMTP Customizado
                          </div>
                        </SelectItem>
                        <SelectItem value="gmail" disabled>
                          Gmail (Em breve)
                        </SelectItem>
                        <SelectItem value="outlook" disabled>
                          Outlook (Em breve)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email de Envio <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu-email@dominio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Este será o email remetente visível para seus clientes
                    </p>
                  </div>

                  {/* Resend */}
                  {provider === 'resend' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">
                          API Key do Resend <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="apiKey"
                          type="password"
                          placeholder="re_..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          required
                        />
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Key className="h-3 w-3 mt-0.5" />
                          <div>
                            Obtenha sua API Key em{' '}
                            <a
                              href="https://resend.com/api-keys"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              resend.com/api-keys
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <AlertCircle className="h-4 w-4" />
                          Verificação de Domínio
                        </h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Para enviar emails, você precisa verificar seu domínio no Resend.
                          Adicione os registros DNS fornecidos pelo Resend nas configurações do seu domínio.
                        </p>
                      </div>
                    </>
                  )}

                  {/* SMTP */}
                  {provider === 'smtp' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="smtpHost">
                            Host SMTP <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="smtpHost"
                            placeholder="smtp.gmail.com"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtpPort">
                            Porta <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="smtpPort"
                            type="number"
                            placeholder="587"
                            value={smtpPort}
                            onChange={(e) => setSmtpPort(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">
                          Usuário SMTP <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="smtpUsername"
                          placeholder="seu-email@gmail.com"
                          value={smtpUsername}
                          onChange={(e) => setSmtpUsername(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">
                          Senha SMTP <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          placeholder="••••••••"
                          value={smtpPassword}
                          onChange={(e) => setSmtpPassword(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Para Gmail, use uma "Senha de App" em vez da senha normal
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => addIntegrationMutation.mutate()}
                    disabled={addIntegrationMutation.isPending || !email}
                  >
                    {addIntegrationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : integrations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground mb-4">
                Nenhuma integração de email configurada
              </p>
              <p className="text-xs text-muted-foreground">
                Adicione uma conta de email para começar a enviar mensagens
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {integrations.map((integration) => (
                <Card key={integration.id} className={integration.is_active ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {getProviderIcon(integration.provider)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{integration.email}</p>
                            {integration.is_active && (
                              <Badge variant="default" className="text-xs">
                                Ativo
                              </Badge>
                            )}
                            {integration.is_verified ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getProviderName(integration.provider)}
                            {!integration.is_verified && ' • Aguardando verificação'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={integration.is_active ? 'outline' : 'default'}
                          size="sm"
                          onClick={() =>
                            toggleIntegrationMutation.mutate({
                              id: integration.id,
                              isActive: !integration.is_active,
                            })
                          }
                          disabled={toggleIntegrationMutation.isPending}
                        >
                          {integration.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIntegrationMutation.mutate(integration.id)}
                          disabled={removeIntegrationMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeIntegration && (
            <>
              <Separator className="my-6" />
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Email Configurado
                </h4>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Todos os emails serão enviados através de:{' '}
                  <strong>{activeIntegration.email}</strong>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
