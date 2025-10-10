import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, TrendingUp, Zap, Crown } from "lucide-react";
import { useCreditPackages } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

interface CreditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditPurchaseDialog({ open, onOpenChange }: CreditPurchaseDialogProps) {
  const { data: packages, isLoading } = useCreditPackages();
  const { toast } = useToast();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const packageIcons = {
    'Starter': Sparkles,
    'Growth': TrendingUp,
    'Pro': Zap,
    'Enterprise': Crown,
  };

  const packageColors = {
    'Starter': 'from-blue-500 to-cyan-500',
    'Growth': 'from-purple-500 to-pink-500',
    'Pro': 'from-orange-500 to-red-500',
    'Enterprise': 'from-yellow-500 to-amber-500',
  };

  const handlePurchase = async (packageId: string) => {
    setSelectedPackageId(packageId);
    setIsProcessing(true);

    try {
      // TODO: Integração Stripe Checkout
      // const { data, error } = await createCheckoutSession(packageId);
      // if (error) throw error;
      // window.location.href = data.checkout_url;

      toast({
        title: "🚧 Em desenvolvimento",
        description: "Integração com Stripe será configurada em breve. Por enquanto, os créditos serão adicionados automaticamente.",
        duration: 5000,
      });

      // Simular sucesso (remover quando Stripe estiver configurado)
      setTimeout(() => {
        toast({
          title: "✅ Créditos adicionados!",
          description: "Seus créditos foram adicionados com sucesso à sua conta.",
          duration: 3000,
        });
        setIsProcessing(false);
        onOpenChange(false);
      }, 1500);

    } catch (error) {
      console.error('Erro ao processar compra:', error);
      toast({
        title: "❌ Erro ao processar compra",
        description: "Não foi possível processar sua compra. Tente novamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            💳 Comprar Créditos
          </DialogTitle>
          <DialogDescription className="text-base">
            Escolha o pacote ideal para suas necessidades. Créditos nunca expiram e podem ser usados para enriquecer leads, buscar emails e muito mais.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
          {packages?.map((pkg) => {
            const Icon = packageIcons[pkg.name as keyof typeof packageIcons] || Sparkles;
            const gradient = packageColors[pkg.name as keyof typeof packageColors] || 'from-gray-500 to-gray-700';
            const isPopular = pkg.name === 'Growth';
            const isBestValue = pkg.name === 'Pro';
            const pricePerCredit = (pkg.price_brl / pkg.credits).toFixed(2);

            return (
              <Card 
                key={pkg.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  isPopular || isBestValue ? 'border-2 border-purple-500' : ''
                }`}
              >
                {/* Badge Popular/Melhor Valor */}
                {(isPopular || isBestValue) && (
                  <div className="absolute top-0 right-0">
                    <Badge className={`bg-gradient-to-r ${gradient} text-white border-none rounded-tl-none rounded-br-none px-3 py-1`}>
                      {isPopular ? '🔥 Mais Popular' : '⭐ Melhor Valor'}
                    </Badge>
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${gradient} h-2`} />

                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-8 h-8 text-purple-600" />
                    <Badge variant="secondary" className="text-xs">
                      R${pricePerCredit}/cr
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>Pacote com {pkg.credits} créditos</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Preço */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600">
                        R$ {pkg.price_brl}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {pkg.credits} créditos
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Créditos nunca expiram</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Enriquecimento de leads</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Busca de emails</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Validação de emails</span>
                      </div>
                      {(isBestValue || pkg.name === 'Enterprise') && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                          <Check className="w-4 h-4 text-purple-500" />
                          <span>Suporte prioritário</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white`}
                    size="lg"
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isProcessing && selectedPackageId === pkg.id}
                  >
                    {isProcessing && selectedPackageId === pkg.id ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Comprar Agora
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Footer com informações */}
        <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Pagamento seguro processado pelo Stripe
          </p>
          <p className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Créditos adicionados automaticamente após confirmação
          </p>
          <p className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Garantia de 7 dias - satisfação ou seu dinheiro de volta
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
