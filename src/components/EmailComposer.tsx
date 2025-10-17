/**
 * EmailComposer - Componente para enviar emails dentro do CRM
 * Integrado com Resend via Supabase Edge Function
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface EmailComposerProps {
  dealId?: string;
  leadId?: string;
  companyId?: string;
  defaultTo?: string;
  defaultSubject?: string;
  triggerButton?: React.ReactNode;
}

// Templates de email pré-definidos
const EMAIL_TEMPLATES = [
  {
    id: 'blank',
    name: 'Em branco',
    subject: '',
    body: '',
  },
  {
    id: 'introduction',
    name: 'Apresentação inicial',
    subject: 'Apresentação - {{company_name}}',
    body: `Olá {{contact_name}},

Espero que esta mensagem encontre você bem!

Meu nome é {{sender_name}} e sou da {{sender_company}}. Identificamos que a {{company_name}} pode se beneficiar de nossas soluções.

Gostaria de agendar uma conversa rápida de 15 minutos para apresentar como podemos ajudar a {{company_name}} a alcançar seus objetivos.

Teria disponibilidade nesta semana?

Atenciosamente,
{{sender_name}}`,
  },
  {
    id: 'follow_up',
    name: 'Follow-up',
    subject: 'Re: Nossa conversa sobre {{topic}}',
    body: `Olá {{contact_name}},

Espero que esteja bem!

Queria dar um rápido follow-up em nossa última conversa sobre {{topic}}.

Temos algumas novidades que acredito serem relevantes para vocês. Podemos agendar uma call esta semana?

Aguardo seu retorno!

Atenciosamente,
{{sender_name}}`,
  },
  {
    id: 'proposal',
    name: 'Envio de proposta',
    subject: 'Proposta comercial - {{company_name}}',
    body: `Olá {{contact_name}},

Conforme combinado, segue em anexo nossa proposta comercial para a {{company_name}}.

Principais destaques:
• [Benefício 1]
• [Benefício 2]
• [Benefício 3]

Estou à disposição para esclarecer qualquer dúvida e ajustar a proposta conforme necessário.

Quando podemos agendar para discutir os próximos passos?

Atenciosamente,
{{sender_name}}`,
  },
];

export function EmailComposer({
  dealId,
  leadId,
  companyId,
  defaultTo = '',
  defaultSubject = '',
  triggerButton,
}: EmailComposerProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [template, setTemplate] = useState('blank');

  // Buscar integração ativa do usuário
  const { data: activeIntegration } = useQuery({
    queryKey: ['active-email-integration'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('email_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle(); // Usar maybeSingle() em vez de single() para não dar erro se não existir

      if (error) {
        console.error('Erro ao buscar integração:', error);
        return null;
      }
      
      return data;
    },
    enabled: open, // Só buscar quando o diálogo estiver aberto
  });

  // Mutation para enviar email
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      console.log('📧 Enviando email...', {
        dealId,
        leadId,
        to,
        subject,
        provider: activeIntegration?.provider,
      });

      // Escolhe a Edge Function baseada no provider
      const functionName = activeIntegration?.provider === 'gmail' 
        ? 'send-email-gmail' 
        : 'send-email';

      console.log(`📤 Usando Edge Function: ${functionName}`);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          dealId,
          leadId,
          companyId,
          to: to.split(',').map(e => e.trim()).filter(Boolean),
          cc: cc ? cc.split(',').map(e => e.trim()).filter(Boolean) : [],
          bcc: bcc ? bcc.split(',').map(e => e.trim()).filter(Boolean) : [],
          subject,
          text: body,
          html: body.replace(/\n/g, '<br>'), // Simples conversão para HTML
        },
      });

      console.log('📧 Resposta do servidor:', { data, error });

      if (error) {
        console.error('❌ Erro da Edge Function:', error);
        throw error;
      }
      
      if (!data?.success) {
        console.error('❌ Edge Function retornou erro:', data);
        throw new Error(data?.error || 'Erro ao enviar email');
      }

      console.log('✅ Email enviado com sucesso!', data);
      return data;
    },
    onSuccess: (data) => {
      if (data.usingSystemEmail) {
        toast.success('📧 Email enviado com sucesso! (usando email do sistema)', {
          description: 'Configure sua integração em Configurações para usar seu próprio email',
          duration: 5000,
        });
      } else {
        toast.success(`📧 Email enviado com sucesso!`);
      }
      
      console.log('✅ Activity ID:', data.activityId);
      console.log('✅ Provider:', data.provider);
      console.log('✅ From:', data.from);
      
      // Invalidar queries para atualizar timeline
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['deal-activities', dealId] });
      
      // Limpar formulário e fechar
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');
      setTemplate('blank');
      setOpen(false);
    },
    onError: (error: any) => {
      console.error('❌ Erro completo:', error);
      toast.error(`Erro ao enviar email: ${error.message || 'Erro desconhecido'}`);
    },
  });

  // Aplicar template
  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId);
    const selectedTemplate = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (selectedTemplate && templateId !== 'blank') {
      setSubject(selectedTemplate.subject);
      setBody(selectedTemplate.body);
    }
  };

  // Validar formulário
  const isValid = to.trim() !== '' && subject.trim() !== '' && body.trim() !== '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Enviar Email
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Novo Email
            </DialogTitle>
            {activeIntegration ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                📧 {activeIntegration.email}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                ⚠️ Email do Sistema
              </Badge>
            )}
          </div>
          <DialogDescription>
            Envie um email diretamente do CRM. A conversa será registrada automaticamente.
            {!activeIntegration && (
              <span className="block mt-1 text-yellow-600 text-xs">
                Configure sua integração em Configurações para usar seu próprio email.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To */}
          <div className="space-y-2">
            <Label htmlFor="to">
              Para <span className="text-red-500">*</span>
            </Label>
            <Input
              id="to"
              type="email"
              placeholder="destinatario@email.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Separe múltiplos emails com vírgula
            </p>
          </div>

          {/* CC */}
          <div className="space-y-2">
            <Label htmlFor="cc">CC (Cópia)</Label>
            <Input
              id="cc"
              type="email"
              placeholder="copia@email.com"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
            />
          </div>

          {/* BCC */}
          <div className="space-y-2">
            <Label htmlFor="bcc">CCO (Cópia Oculta)</Label>
            <Input
              id="bcc"
              type="email"
              placeholder="copiaoculta@email.com"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Assunto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Digite o assunto do email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">
              Mensagem <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="body"
              placeholder="Digite sua mensagem aqui..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              {body.length} caracteres
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={sendEmailMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => sendEmailMutation.mutate()}
            disabled={!isValid || sendEmailMutation.isPending}
          >
            {sendEmailMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
