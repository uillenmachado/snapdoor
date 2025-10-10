import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertTriangle, Zap } from "lucide-react";

interface InsufficientCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  required: number;
  current: number;
  onPurchase: () => void;
}

export function InsufficientCreditsDialog({
  open,
  onOpenChange,
  required,
  current,
  onPurchase,
}: InsufficientCreditsDialogProps) {
  const deficit = required - current;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-xl">Créditos Insuficientes</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-base">
            <p>
              Você precisa de <span className="font-bold text-orange-600">{required} créditos</span> para realizar esta ação,
              mas possui apenas <span className="font-bold">{current} créditos</span>.
            </p>
            <p>
              Faltam <span className="font-bold text-red-600">{deficit} créditos</span> para continuar.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 <strong>Dica:</strong> Com o pacote Starter (50 créditos por R$ 47), você teria créditos
                suficientes para {Math.floor(50 / required)} ações deste tipo!
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onPurchase();
              onOpenChange(false);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Comprar Créditos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
