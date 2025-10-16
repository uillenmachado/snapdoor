import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, Download, ArrowRight, CheckCircle2, Play } from "lucide-react";

const Help = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <PageHeader
            title="Ajuda & Tutoriais"
            description="Guias, tutoriais e respostas para suas dúvidas"
          />

          <main className="flex-1 overflow-auto p-6 space-y-6">
            {/* Início Rápido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Início Rápido
                </CardTitle>
                <CardDescription>
                  Comece a usar o SnapDoor em poucos minutos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">Instale a Extensão</h3>
                      <p className="text-sm text-muted-foreground">
                        Adicione nossa extensão ao Chrome para capturar leads do LinkedIn
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">Configure Pipelines</h3>
                      <p className="text-sm text-muted-foreground">
                        Personalize as etapas do seu processo de vendas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">Use SnapDoor AI</h3>
                      <p className="text-sm text-muted-foreground">
                        Prospecte leads automaticamente com inteligência artificial
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>
                  Respostas para as dúvidas mais comuns sobre o SnapDoor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Como funciona a importação de leads do LinkedIn?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Nossa extensão detecta automaticamente quando você está em um perfil do LinkedIn e 
                        extrai informações como nome, cargo, empresa e localização. Com um clique, essas 
                        informações são enviadas diretamente para seu pipeline no SnapDoor.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>É seguro usar a extensão do SnapDoor?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Sim, nossa extensão é totalmente segura. Ela apenas lê informações públicas 
                        do LinkedIn e não acessa dados privados. Todas as informações são 
                        criptografadas e enviadas diretamente para nossa API segura.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>Posso personalizar as etapas do meu pipeline?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Sim! Você pode criar, editar e remover etapas do pipeline de acordo com 
                        seu processo de vendas. Basta clicar nos três pontos ao lado de cada etapa 
                        no quadro Kanban para acessar as opções de edição.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>Como funciona o sistema de scoring de leads?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Nosso algoritmo analisa automaticamente o perfil do LinkedIn e atribui uma 
                        pontuação de 0 a 100 baseada em fatores como completude do perfil, experiência, 
                        educação e relevância da posição atual.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>Qual a diferença entre os planos?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Free:</strong> Até 50 leads, 1 pipeline, recursos básicos</p>
                        <p><strong>Starter:</strong> Até 500 leads, 3 pipelines, analytics básicos</p>
                        <p><strong>Advanced:</strong> Até 2.000 leads, pipelines ilimitados, automações</p>
                        <p><strong>Pro:</strong> Leads ilimitados, usuários ilimitados, suporte prioritário</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Recursos Avançados */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos Avançados</CardTitle>
                <CardDescription>
                  Aproveite ao máximo todas as funcionalidades do SnapDoor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      🔍 Busca Global
                      <Badge variant="secondary">Cmd+K</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Use Cmd+K (ou Ctrl+K) para abrir a busca global e encontrar 
                      qualquer lead, nota ou atividade rapidamente.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">📊 Analytics em Tempo Real</h3>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe métricas importantes como taxa de conversão, 
                      leads por etapa e performance de atividades.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">🏷️ Tags e Filtros</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize seus leads com tags personalizadas e use filtros 
                      avançados para segmentar sua base.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">📱 PWA Mobile</h3>
                    <p className="text-sm text-muted-foreground">
                      Instale o SnapDoor como app no seu celular para 
                      acessar seus leads mesmo offline.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suporte */}
            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
                <CardDescription>
                  Nossa equipe está aqui para ajudar você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <ExternalLink className="h-5 w-5 mb-2" />
                    Documentação
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    📧
                    Email Suporte
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    💬
                    Chat Online
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Help;