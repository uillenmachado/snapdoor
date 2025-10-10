import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, BarChart3, Users, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">snapdoor</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.location.href = "/pricing"}>
              Preços
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = "/login"}>
              Entrar
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = "/pricing"}>
              Teste Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-accent py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              O CRM que transforma leads do LinkedIn em clientes
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Capture perfis do LinkedIn, gerencie seu funil de vendas e feche mais negócios.
              Simples, visual e poderoso.
            </p>
            <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            className="h-12 px-8"
            onClick={() => window.location.href = "/signup"}
          >
            Começar teste grátis <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8"
            onClick={() => window.location.href = "/login"}
          >
            Ver demo
          </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ Teste grátis por 14 dias • Sem cartão de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-xl text-muted-foreground">
              Integração perfeita com LinkedIn, pipeline visual e muito mais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Integração com LinkedIn
              </h3>
              <p className="text-muted-foreground">
                Capture leads diretamente do LinkedIn com nossa extensão.
                Nome, cargo e empresa automaticamente.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pipeline Visual</h3>
              <p className="text-muted-foreground">
                Visualize todo seu funil de vendas. Arraste e solte cards
                entre as etapas com facilidade.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ações Rápidas</h3>
              <p className="text-muted-foreground">
                Registre mensagens, emails e ligações. Mantenha todo
                histórico organizado em um só lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Por que escolher nosso CRM?
            </h2>
            <div className="space-y-6">
              {[
                "Integração nativa com LinkedIn",
                "Interface intuitiva e visual",
                "Pipeline totalmente personalizável",
                "Histórico completo de interações",
                "Relatórios e análises em tempo real",
                "Suporte dedicado em português",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para transformar seus leads em clientes?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já usam nosso CRM para
            vender mais através do LinkedIn.
          </p>
          <Button
            size="lg"
            className="h-12 px-8"
            onClick={() => window.location.href = "/signup"}
          >
            Começar agora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 snapdoor CRM. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
