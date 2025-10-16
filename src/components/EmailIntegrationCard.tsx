import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Send, Loader2, Paperclip, AtSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EmailThread {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  direction: 'sent' | 'received';
}

interface EmailIntegrationCardProps {
  dealId: string;
  participantEmails: string[];
  dealTitle: string;
}

export function EmailIntegrationCard({ dealId, participantEmails, dealTitle }: EmailIntegrationCardProps) {
  const [isComposingEmail, setIsComposingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [isSending, setIsSending] = useState(false);
  
  // Mock email threads - substituir por dados reais do banco
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>([
    {
      id: "1",
      from: "voce@empresa.com",
      to: participantEmails[0] || "cliente@empresa.com",
      subject: `Re: ${dealTitle}`,
      body: "Olá! Gostaria de agendar uma reunião para discutir os próximos passos.",
      sentAt: new Date(Date.now() - 86400000).toISOString(),
      direction: 'sent'
    }
  ]);

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      toast.error("Preencha todos os campos do email");
      return;
    }

    setIsSending(true);

    try {
      // TODO: Integrar com API de envio de email (SendGrid, AWS SES, etc)
      // Por enquanto, simular envio
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newEmail: EmailThread = {
        id: Date.now().toString(),
        from: "voce@empresa.com", // Pegar do usuário autenticado
        to: emailForm.to,
        subject: emailForm.subject,
        body: emailForm.body,
        sentAt: new Date().toISOString(),
        direction: 'sent'
      };

      setEmailThreads([newEmail, ...emailThreads]);
      
      // Resetar formulário
      setEmailForm({ to: "", subject: "", body: "" });
      setIsComposingEmail(false);
      
      toast.success("✉️ Email enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  const handleComposeEmail = () => {
    // Pre-preencher com email do participante principal
    if (participantEmails.length > 0) {
      setEmailForm({
        ...emailForm,
        to: participantEmails[0],
        subject: `Re: ${dealTitle}`,
      });
    }
    setIsComposingEmail(true);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email & Comunicação
            </CardTitle>
            <CardDescription>
              Histórico de emails enviados para esta oportunidade
            </CardDescription>
          </div>
          
          <Dialog open={isComposingEmail} onOpenChange={setIsComposingEmail}>
            <DialogTrigger asChild>
              <Button onClick={handleComposeEmail}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Novo Email</DialogTitle>
                <DialogDescription>
                  Envie um email para os participantes desta oportunidade
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email-to" className="flex items-center gap-2">
                    <AtSign className="h-4 w-4" />
                    Para
                  </Label>
                  <Input
                    id="email-to"
                    type="email"
                    placeholder="cliente@empresa.com"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                  />
                  {participantEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {participantEmails.map((email, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setEmailForm({ ...emailForm, to: email })}
                          className="text-xs"
                        >
                          {email}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-subject">Assunto</Label>
                  <Input
                    id="email-subject"
                    placeholder={`Re: ${dealTitle}`}
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-body">Mensagem</Label>
                  <Textarea
                    id="email-body"
                    placeholder="Digite sua mensagem..."
                    value={emailForm.body}
                    onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Paperclip className="h-4 w-4" />
                  <span>Anexos (em breve)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsComposingEmail(false)}
                  disabled={isSending}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSendEmail} disabled={isSending}>
                  {isSending ? (
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
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {emailThreads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum email enviado ainda</p>
            <p className="text-sm">Clique em "Enviar Email" para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emailThreads.map((email) => (
              <div
                key={email.id}
                className={`p-4 border rounded-lg ${
                  email.direction === 'sent'
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      <span>{email.direction === 'sent' ? 'Você' : email.from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-muted-foreground">{email.to}</span>
                    </div>
                    <div className="text-sm font-semibold mt-1">{email.subject}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(email.sentAt), "dd MMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {email.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
