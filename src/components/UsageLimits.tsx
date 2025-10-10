import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Subscription, PLAN_LIMITS } from "@/hooks/useSubscription";

interface UsageLimitsProps {
  subscription: Subscription | null | undefined;
  leadsCount: number;
  pipelinesCount: number;
}

export function UsageLimits({ subscription, leadsCount, pipelinesCount }: UsageLimitsProps) {
  if (!subscription) return null;

  const plan = PLAN_LIMITS[subscription.plan];
  const leadsLimit = plan.leads;
  const pipelinesLimit = plan.pipelines;

  const leadsPercentage = leadsLimit === -1 ? 0 : (leadsCount / leadsLimit) * 100;
  const isPipelinesNearLimit = pipelinesLimit !== -1 && (pipelinesCount / pipelinesLimit) * 100 >= 80;

  const isLeadsNearLimit = leadsPercentage >= 80;
  const showUpgrade = isLeadsNearLimit || isPipelinesNearLimit || subscription.plan === "free";

  return (
    <div className="flex items-center">
      <div className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        isLeadsNearLimit || isPipelinesNearLimit 
          ? "bg-orange-100 text-orange-700 border border-orange-200" 
          : "bg-muted/60 text-muted-foreground hover:bg-muted/80"
      }`}>
        <div className="flex items-center gap-2">
          <span>Plano {plan.name}</span>
          {leadsLimit !== -1 && (
            <span className="text-xs opacity-75">
              {leadsCount}/{leadsLimit} leads
            </span>
          )}
          {showUpgrade && (
            <Link to="/pricing" className="ml-1">
              <Button size="sm" variant="ghost" className="h-5 px-1.5 text-xs hover:bg-background/50">
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

