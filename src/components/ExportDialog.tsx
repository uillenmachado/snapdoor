/**
 * Export Dialog Component
 * 
 * Dialog para configurar e executar exportação de dados em CSV, Excel ou PDF.
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileDown, FileSpreadsheet, FileType, FileText } from "lucide-react";
import { toast } from "sonner";
import type {
  EntityType,
  ExportFileType,
  ExportConfig,
  ExportColumn,
} from "@/types/import-export";
import { DEFAULT_EXPORT_COLUMNS, generateExportFilename } from "@/types/import-export";
import { executeExport, previewExport } from "@/services/exportService";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  filters?: Record<string, any>;
}

export function ExportDialog({ open, onOpenChange, entityType, filters }: ExportDialogProps) {
  const { user } = useAuth();
  const [format, setFormat] = useState<ExportFileType>("csv");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    DEFAULT_EXPORT_COLUMNS[entityType].map((col) => col.field)
  );
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [limit, setLimit] = useState<number>(0);
  const [filename, setFilename] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const allColumns = DEFAULT_EXPORT_COLUMNS[entityType];

  const handleReset = () => {
    setFormat("csv");
    setSelectedColumns(allColumns.map((col) => col.field));
    setIncludeHeaders(true);
    setLimit(0);
    setFilename("");
    setIsExporting(false);
    setPreview(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleColumnToggle = (field: string) => {
    if (selectedColumns.includes(field)) {
      setSelectedColumns(selectedColumns.filter((f) => f !== field));
    } else {
      setSelectedColumns([...selectedColumns, field]);
    }
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === allColumns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(allColumns.map((col) => col.field));
    }
  };

  const handlePreview = async () => {
    if (!user) return;

    try {
      toast.loading("Gerando preview...");

      const columns = allColumns.filter((col) => selectedColumns.includes(col.field));

      const config: ExportConfig = {
        entityType,
        format,
        columns,
        filters,
        limit: 10, // Preview com 10 registros
        includeHeaders,
      };

      const result = await previewExport(config, user.id);
      setPreview(result);
      
      toast.dismiss();
      toast.success(`Preview gerado: ${result.totalRecords} registros encontrados`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Erro ao gerar preview");
    }
  };

  const handleExport = async () => {
    if (!user) return;

    if (selectedColumns.length === 0) {
      toast.error("Selecione ao menos uma coluna");
      return;
    }

    try {
      setIsExporting(true);
      toast.loading("Exportando dados...");

      const columns = allColumns.filter((col) => selectedColumns.includes(col.field));

      const config: ExportConfig = {
        entityType,
        format,
        columns,
        filters,
        limit: limit > 0 ? limit : undefined,
        includeHeaders,
        filename: filename || generateExportFilename(entityType, format),
        pdfConfig: {
          title: `Relatório de ${entityType}`,
          subtitle: `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
          orientation: "landscape",
          includeFooter: true,
          themeColor: "#3b82f6",
        },
      };

      await executeExport(config, user.id);

      toast.dismiss();
      toast.success("Exportação concluída!");
      handleClose();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Erro na exportação");
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (fmt: ExportFileType) => {
    switch (fmt) {
      case "csv":
        return <FileType className="h-4 w-4" />;
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exportar {entityType}</DialogTitle>
          <DialogDescription>
            Escolha o formato e as colunas para exportar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formato */}
          <div className="space-y-2">
            <Label>Formato</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["csv", "excel", "pdf"] as ExportFileType[]).map((fmt) => (
                <Button
                  key={fmt}
                  variant={format === fmt ? "default" : "outline"}
                  onClick={() => setFormat(fmt)}
                  className="w-full"
                >
                  {getFormatIcon(fmt)}
                  <span className="ml-2">{fmt.toUpperCase()}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Colunas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Colunas ({selectedColumns.length}/{allColumns.length})</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedColumns.length === allColumns.length ? "Desmarcar" : "Selecionar"} Todas
              </Button>
            </div>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              <div className="space-y-2">
                {allColumns.map((col) => (
                  <div key={col.field} className="flex items-center space-x-2">
                    <Checkbox
                      id={col.field}
                      checked={selectedColumns.includes(col.field)}
                      onCheckedChange={() => handleColumnToggle(col.field)}
                    />
                    <Label
                      htmlFor={col.field}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {col.label}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Opções */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Limite de registros (0 = todos)</Label>
              <Input
                id="limit"
                type="number"
                min={0}
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filename">Nome do arquivo (opcional)</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder={generateExportFilename(entityType, format)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeHeaders"
              checked={includeHeaders}
              onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
            />
            <Label htmlFor="includeHeaders" className="text-sm">
              Incluir cabeçalhos
            </Label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">Preview</div>
              <div className="text-sm text-muted-foreground">
                {preview.totalRecords} registros serão exportados
              </div>
              {preview.previewData.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Primeiros {preview.previewData.length} registros visualizados
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isExporting}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handlePreview} disabled={isExporting}>
            Preview
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedColumns.length === 0}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
