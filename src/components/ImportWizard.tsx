/**
 * Import Wizard Component
 * 
 * Wizard multi-step para importação de dados de CSV/Excel.
 * Passos: 1) Upload, 2) Mapeamento, 3) Preview, 4) Confirmação
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileSpreadsheet, FileType, CheckCircle2, AlertCircle, X, Download } from "lucide-react";
import { toast } from "sonner";
import type {
  EntityType,
  ImportFileType,
  ImportConfig,
  ParsedFileData,
  ColumnMapping,
  ImportProgress,
  ImportResult,
} from "@/types/import-export";
import { DEFAULT_COLUMN_MAPPINGS, formatFileSize } from "@/types/import-export";
import { parseFile, previewImport, executeImport } from "@/services/importService";
import { downloadImportTemplate } from "@/services/exportService";

interface ImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: EntityType;
  onComplete?: (result: ImportResult) => void;
}

type WizardStep = "upload" | "mapping" | "preview" | "importing" | "complete";

export function ImportWizard({ open, onOpenChange, entityType, onComplete }: ImportWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<WizardStep>("upload");
  
  // Upload step
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<ImportFileType>("csv");
  
  // Mapping step
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  
  // Options
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(true);
  
  // Preview step
  const [previewResult, setPreviewResult] = useState<any>(null);
  
  // Import step
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setParsedData(null);
    setColumnMappings([]);
    setPreviewResult(null);
    setImportProgress(null);
    setImportResult(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  // ===== STEP 1: UPLOAD =====

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "csv") {
      setFileType("csv");
    } else if (extension === "xlsx" || extension === "xls") {
      setFileType("excel");
    } else {
      toast.error("Formato de arquivo não suportado. Use CSV ou Excel.");
      return;
    }

    setSelectedFile(file);
  };

  const handleNextFromUpload = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo");
      return;
    }

    try {
      toast.loading("Lendo arquivo...");
      const data = await parseFile(selectedFile, fileType);
      setParsedData(data);
      
      // Inicializar mapeamentos com padrões
      const defaultMappings = DEFAULT_COLUMN_MAPPINGS[entityType];
      setColumnMappings(defaultMappings);
      
      toast.dismiss();
      toast.success(`Arquivo lido: ${data.rows.length} registros encontrados`);
      setStep("mapping");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Erro ao ler arquivo");
    }
  };

  const handleDownloadTemplate = () => {
    const columns = DEFAULT_COLUMN_MAPPINGS[entityType].map((m) => m.sourceColumn);
    downloadImportTemplate(entityType, columns);
    toast.success("Template baixado!");
  };

  // ===== STEP 2: MAPPING =====

  const handleMappingChange = (index: number, sourceColumn: string) => {
    const newMappings = [...columnMappings];
    newMappings[index] = {
      ...newMappings[index],
      sourceColumn,
    };
    setColumnMappings(newMappings);
  };

  const handleNextFromMapping = async () => {
    if (!parsedData || !user) return;

    // Validar que campos obrigatórios foram mapeados
    const missingRequired = columnMappings
      .filter((m) => m.required && !m.sourceColumn)
      .map((m) => m.targetField);

    if (missingRequired.length > 0) {
      toast.error(`Campos obrigatórios não mapeados: ${missingRequired.join(", ")}`);
      return;
    }

    try {
      toast.loading("Validando dados...");
      
      const config: ImportConfig = {
        entityType,
        fileType,
        file: selectedFile!,
        columnMappings: columnMappings.filter((m) => m.sourceColumn),
        allowDuplicates,
        duplicateCheckField: allowDuplicates ? undefined : "email",
        updateExisting,
        skipInvalid,
      };

      const preview = await previewImport(config, user.id);
      setPreviewResult(preview);
      
      toast.dismiss();
      setStep("preview");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Erro na validação");
    }
  };

  // ===== STEP 3: PREVIEW =====

  const handleStartImport = async () => {
    if (!selectedFile || !user) return;

    try {
      setStep("importing");

      const config: ImportConfig = {
        entityType,
        fileType,
        file: selectedFile,
        columnMappings: columnMappings.filter((m) => m.sourceColumn),
        allowDuplicates,
        duplicateCheckField: allowDuplicates ? undefined : "email",
        updateExisting,
        skipInvalid,
      };

      const result = await executeImport(config, user.id, (progress) => {
        setImportProgress(progress);
      });

      setImportResult(result);
      setStep("complete");

      if (result.status === "completed") {
        toast.success(`Importação concluída! ${result.successfulImports} registros importados.`);
      } else if (result.status === "partial") {
        toast.warning(
          `Importação parcial: ${result.successfulImports} sucesso, ${result.failedImports} falhas.`
        );
      } else {
        toast.error("Importação falhou");
      }

      if (onComplete) {
        onComplete(result);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na importação");
      setStep("preview");
    }
  };

  // ===== RENDER =====

  const renderStepIndicator = () => {
    const steps = [
      { key: "upload", label: "Upload" },
      { key: "mapping", label: "Mapeamento" },
      { key: "preview", label: "Preview" },
      { key: "importing", label: "Importando" },
    ];

    const currentIndex = steps.findIndex((s) => s.key === step);

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, index) => {
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex || step === "complete";

          return (
            <div key={s.key} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isComplete
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>
              <span className={`ml-2 text-sm ${isActive ? "font-semibold" : ""}`}>
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-200 mx-2" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Selecione um arquivo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Formatos suportados: CSV, Excel (.xlsx, .xls)
        </p>
        
        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          className="mb-4"
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Template
        </Button>
      </div>

      <div className="border-2 border-dashed border-muted rounded-lg p-8">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-2" />
          <span className="text-sm font-medium">Clique para selecionar</span>
          <span className="text-xs text-muted-foreground">ou arraste e solte aqui</span>
        </label>
      </div>

      {selectedFile && (
        <Alert>
          <FileType className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)} · {fileType.toUpperCase()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleNextFromUpload} disabled={!selectedFile}>
          Próximo
        </Button>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Mapeamento de Colunas</h3>
        <p className="text-sm text-muted-foreground">
          {parsedData?.rows.length} registros · {parsedData?.columns.length} colunas encontradas
        </p>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {columnMappings.map((mapping, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">
                  {mapping.targetField}
                  {mapping.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
              <div className="flex-1">
                <Select
                  value={mapping.sourceColumn}
                  onValueChange={(value) => handleMappingChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- Não mapear --</SelectItem>
                    {parsedData?.columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowDuplicates"
            checked={allowDuplicates}
            onCheckedChange={(checked) => setAllowDuplicates(checked as boolean)}
          />
          <Label htmlFor="allowDuplicates" className="text-sm">
            Permitir duplicatas
          </Label>
        </div>
        {!allowDuplicates && (
          <div className="flex items-center space-x-2 ml-6">
            <Checkbox
              id="updateExisting"
              checked={updateExisting}
              onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
            />
            <Label htmlFor="updateExisting" className="text-sm">
              Atualizar registros existentes
            </Label>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="skipInvalid"
            checked={skipInvalid}
            onCheckedChange={(checked) => setSkipInvalid(checked as boolean)}
          />
          <Label htmlFor="skipInvalid" className="text-sm">
            Pular registros inválidos
          </Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep("upload")}>
          Voltar
        </Button>
        <Button onClick={handleNextFromMapping}>
          Próximo
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Preview da Importação</h3>
        
        {previewResult && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {previewResult.validation.valid}
              </div>
              <div className="text-sm text-muted-foreground">Registros válidos</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {previewResult.validation.invalid}
              </div>
              <div className="text-sm text-muted-foreground">Registros inválidos</div>
            </Card>
            {previewResult.duplicates && (
              <Card className="p-4">
                <div className="text-2xl font-bold text-amber-600">
                  {previewResult.duplicates.count}
                </div>
                <div className="text-sm text-muted-foreground">Duplicatas</div>
              </Card>
            )}
          </div>
        )}

        {previewResult?.validation.invalid > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {previewResult.validation.invalid} registros inválidos serão{" "}
              {skipInvalid ? "pulados" : "bloqueados"}.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep("mapping")}>
          Voltar
        </Button>
        <Button onClick={handleStartImport}>
          Iniciar Importação
        </Button>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {importProgress?.message || "Importando..."}
        </h3>
        {importProgress && (
          <>
            <Progress value={importProgress.percentage} className="mb-4" />
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <span className="font-medium">{importProgress.success}</span>
                <span className="text-muted-foreground ml-1">sucesso</span>
              </div>
              <div>
                <span className="font-medium">{importProgress.failed}</span>
                <span className="text-muted-foreground ml-1">falhas</span>
              </div>
              <div>
                <span className="font-medium">{importProgress.skipped}</span>
                <span className="text-muted-foreground ml-1">pulados</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        {importResult?.status === "completed" ? (
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        ) : (
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">
          {importResult?.status === "completed"
            ? "Importação Concluída!"
            : "Importação Parcial"}
        </h3>
        {importResult && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {importResult.successfulImports} de {importResult.totalRecords} registros importados
            </p>
            <p className="text-xs text-muted-foreground">
              Tempo: {(importResult.executionTime / 1000).toFixed(2)}s
            </p>
          </div>
        )}
      </div>

      <Button onClick={handleClose} className="w-full">
        Fechar
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar {entityType}</DialogTitle>
          <DialogDescription>
            Importe dados de arquivos CSV ou Excel
          </DialogDescription>
        </DialogHeader>

        {step !== "complete" && renderStepIndicator()}

        {step === "upload" && renderUploadStep()}
        {step === "mapping" && renderMappingStep()}
        {step === "preview" && renderPreviewStep()}
        {step === "importing" && renderImportingStep()}
        {step === "complete" && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
}

// Helper Card component
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border rounded-lg ${className}`}>
      {children}
    </div>
  );
}
