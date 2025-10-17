import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  TrendingUp,
  ExternalLink,
  Edit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  logo_url?: string;
  employee_count?: number;
}

interface CompanyDetailsProps {
  company?: Company | null;
  companyId?: string;
}

export function CompanyDetails({ company, companyId }: CompanyDetailsProps) {
  const navigate = useNavigate();

  if (!company && !companyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5" />
            Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma empresa vinculada a esta oportunidade
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => {/* TODO: Open company selector */}}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Vincular Empresa
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-5 w-5 text-primary" />
          Empresa
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => company && navigate(`/companies/${company.id}`)}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Name & Logo */}
        <div className="flex items-start gap-3">
          {company?.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={company.name} 
              className="h-12 w-12 rounded-lg object-cover border"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{company?.name || "Empresa Desconhecida"}</h3>
            {company?.domain && (
              <p className="text-sm text-muted-foreground truncate">{company.domain}</p>
            )}
          </div>
        </div>

        {/* Company Info Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Industry */}
          {company?.industry && (
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Indústria</p>
                <p className="text-sm font-medium truncate">{company.industry}</p>
              </div>
            </div>
          )}

          {/* Company Size */}
          {company?.size && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Tamanho</p>
                <p className="text-sm font-medium truncate">{company.size}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {company?.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Localização</p>
                <p className="text-sm font-medium truncate">{company.location}</p>
              </div>
            </div>
          )}

          {/* Employee Count */}
          {company?.employee_count && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Funcionários</p>
                <p className="text-sm font-medium">
                  {company.employee_count.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Website Link */}
        {company?.website && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.open(company.website.startsWith('http') ? company.website : `https://${company.website}`, '_blank')}
          >
            <Globe className="h-4 w-4 mr-2" />
            <span className="truncate">{company.website}</span>
            <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
          </Button>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => company && navigate(`/companies/${company.id}`)}
          >
            Ver Detalhes Completos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* TODO: Edit company */}}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
