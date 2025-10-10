import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription, PLAN_LIMITS } from "@/hooks/useSubscription";
import { useStripeCheckout } from "@/hooks/useStripe";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Pricing = () => {
  const { user } = useAuth();
  const { data: subscription } = useSubscription(user?.id);
  const { createCheckoutSession, loading: stripeLoading } = useStripeCheckout();
  const navigate = useNavigate();

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "Grátis",
      period: "",
      description: "Para começar e testar o Snapdoor",
      features: PLAN_LIMITS.free.features,
      highlighted: false,
    },
    {
      id: "starter",
      name: "Starter",
      price: `R$ ${PLAN_LIMITS.starter.price}`,
      period: "/mês",
      description: "Perfeito para freelancers e pequenos times",
      features: PLAN_LIMITS.starter.features,
      highlighted: false,
    },
    {
      id: "advanced",
      name: "Advanced",
      price: `R$ ${PLAN_LIMITS.advanced.price}`,
      period: "/mês",
      description: "Para equipes crescendo com processos definidos",
      features: PLAN_LIMITS.advanced.features,
      highlighted: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: `R$ ${PLAN_LIMITS.pro.price}`,
      period: "/mês",
      description: "Para empresas com alta demanda e processos complexos",
      features: PLAN_LIMITS.pro.features,
      highlighted: false,
    },
  ];

  const isCurrentPlan = (planId: string) => {
    return subscription?.plan === planId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            snapdoor
          </Link>
          {user ? (
            <Link to="/dashboard">
              <Button variant="outline">Ir para Dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button>Fazer Login</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Escolha o plano ideal para seu negócio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Comece grátis e faça upgrade quando precisar de mais recursos.
          Sem taxas escondidas, cancele quando quiser.
        </p>
        {subscription && (
          <Badge variant="secondary" className="text-sm">
            Plano Atual: {PLAN_LIMITS[subscription.plan].name}
          </Badge>
        )}
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.highlighted
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Zap className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrentPlan(plan.id) ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano Atual
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-primary hover:bg-primary/90"
                        : ""
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                    disabled={stripeLoading}
                    onClick={async () => {
                      if (plan.id === "free") {
                        if (user) {
                          navigate("/dashboard");
                        } else {
                          navigate("/signup");
                        }
                      } else {
                        if (!user) {
                          toast.error("Faça login para fazer upgrade do plano");
                          navigate("/login");
                        } else {
                          // Iniciar checkout do Stripe
                          try {
                            await createCheckoutSession(plan.id as 'starter' | 'advanced' | 'pro');
                          } catch (error) {
                            toast.error("Erro ao processar pagamento. Tente novamente.");
                          }
                        }
                      }
                    }}
                  >
                    {stripeLoading ? "Processando..." : (plan.id === "free" ? "Começar Grátis" : "Fazer Upgrade")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Perguntas Frequentes
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posso mudar de plano a qualquer momento?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                Mudanças são aplicadas imediatamente e o valor é ajustado proporcionalmente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">O que acontece se eu exceder o limite de leads?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Você será notificado quando se aproximar do limite. Poderá fazer upgrade
                para um plano superior ou remover leads antigos para liberar espaço.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vocês oferecem reembolso?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sim, oferecemos garantia de reembolso de 14 dias sem perguntas.
                Se não estiver satisfeito, devolvemos 100% do valor pago.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">A extensão do navegador funciona em todos os planos?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sim! A extensão para capturar leads do LinkedIn está disponível
                em todos os planos, incluindo o gratuito.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Pronto para começar?</CardTitle>
            <CardDescription>
              Junte-se a centenas de profissionais que já transformaram
              suas vendas com o Snapdoor CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={user ? "/dashboard" : "/signup"}>
              <Button size="lg" className="text-lg px-8">
                {user ? "Ir para Dashboard" : "Começar Grátis"}
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Não precisa cartão de crédito
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Pricing;
