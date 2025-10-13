/**
 * Import/Export Types
 * 
 * Types e interfaces para o sistema de importação/exportação de dados.
 * Suporta CSV, Excel e PDF.
 */

// ==================== ENUMS ====================

/**
 * Tipos de arquivo suportados para importação
 */
export type ImportFileType = "csv" | "excel";

/**
 * Tipos de arquivo suportados para exportação
 */
export type ExportFileType = "csv" | "excel" | "pdf";

/**
 * Tipos de entidades que podem ser importadas/exportadas
 */
export type EntityType = "leads" | "companies" | "deals" | "tasks" | "meetings";

/**
 * Tipos de validação
 */
export type ValidationType = 
  | "required"
  | "email"
  | "phone"
  | "url"
  | "date"
  | "number"
  | "enum";

/**
 * Status da importação
 */
export type ImportStatus = 
  | "pending"      // Aguardando processamento
  | "processing"   // Em processamento
  | "completed"    // Concluída com sucesso
  | "failed"       // Falhou
  | "partial";     // Parcialmente concluída (alguns registros falharam)

// ==================== INTERFACES ====================

/**
 * Configuração de mapeamento de coluna
 */
export interface ColumnMapping {
  /** Nome da coluna no arquivo */
  sourceColumn: string;
  /** Campo de destino no banco */
  targetField: string;
  /** Transformação a ser aplicada (opcional) */
  transform?: (value: any) => any;
  /** Validações para esta coluna */
  validations?: ValidationRule[];
  /** Se é um campo obrigatório */
  required?: boolean;
  /** Valor padrão se estiver vazio */
  defaultValue?: any;
}

/**
 * Regra de validação
 */
export interface ValidationRule {
  type: ValidationType;
  /** Mensagem de erro personalizada */
  message?: string;
  /** Opções adicionais (ex: enum values, regex pattern) */
  options?: any;
}

/**
 * Resultado de validação de um registro
 */
export interface ValidationResult {
  /** Se o registro é válido */
  isValid: boolean;
  /** Erros encontrados (campo -> mensagem) */
  errors: Record<string, string>;
  /** Avisos (não bloqueiam importação) */
  warnings: Record<string, string>;
  /** Dados após transformações */
  transformedData: Record<string, any>;
}

/**
 * Configuração de importação
 */
export interface ImportConfig {
  /** Tipo de entidade sendo importada */
  entityType: EntityType;
  /** Tipo de arquivo */
  fileType: ImportFileType;
  /** Arquivo sendo importado */
  file: File;
  /** Mapeamento de colunas */
  columnMappings: ColumnMapping[];
  /** Se deve criar registros duplicados */
  allowDuplicates?: boolean;
  /** Campo para verificar duplicatas */
  duplicateCheckField?: string;
  /** Se deve atualizar registros existentes */
  updateExisting?: boolean;
  /** Se deve pular registros inválidos */
  skipInvalid?: boolean;
}

/**
 * Progresso da importação
 */
export interface ImportProgress {
  /** Total de registros */
  total: number;
  /** Registros processados */
  processed: number;
  /** Registros importados com sucesso */
  success: number;
  /** Registros que falharam */
  failed: number;
  /** Registros pulados (duplicatas, inválidos) */
  skipped: number;
  /** Porcentagem de conclusão */
  percentage: number;
  /** Status atual */
  status: ImportStatus;
  /** Mensagem de status */
  message?: string;
  /** Erros detalhados */
  errors?: Array<{
    row: number;
    data: Record<string, any>;
    errors: Record<string, string>;
  }>;
}

/**
 * Resultado final da importação
 */
export interface ImportResult {
  /** Status final */
  status: ImportStatus;
  /** Total de registros */
  totalRecords: number;
  /** Registros importados com sucesso */
  successfulImports: number;
  /** Registros que falharam */
  failedImports: number;
  /** Registros pulados */
  skippedRecords: number;
  /** Tempo de execução (ms) */
  executionTime: number;
  /** IDs dos registros criados */
  createdIds: string[];
  /** Detalhes dos erros */
  errors: Array<{
    row: number;
    data: Record<string, any>;
    errors: Record<string, string>;
  }>;
  /** Detalhes dos avisos */
  warnings: Array<{
    row: number;
    message: string;
  }>;
}

/**
 * Configuração de exportação
 */
export interface ExportConfig {
  /** Tipo de entidade sendo exportada */
  entityType: EntityType;
  /** Formato de exportação */
  format: ExportFileType;
  /** Colunas a serem incluídas */
  columns: ExportColumn[];
  /** Filtros aplicados */
  filters?: Record<string, any>;
  /** Ordenação */
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
  /** Limite de registros (0 = todos) */
  limit?: number;
  /** Se deve incluir cabeçalhos */
  includeHeaders?: boolean;
  /** Nome do arquivo de saída */
  filename?: string;
  /** Configurações específicas para PDF */
  pdfConfig?: PDFExportConfig;
}

/**
 * Configuração de coluna para exportação
 */
export interface ExportColumn {
  /** Campo no banco de dados */
  field: string;
  /** Label no cabeçalho */
  label: string;
  /** Formatação customizada */
  format?: (value: any, record: any) => string;
  /** Largura da coluna (para PDF e Excel) */
  width?: number;
  /** Alinhamento (para PDF) */
  align?: "left" | "center" | "right";
}

/**
 * Configuração específica para exportação PDF
 */
export interface PDFExportConfig {
  /** Título do documento */
  title?: string;
  /** Subtítulo ou descrição */
  subtitle?: string;
  /** Orientação da página */
  orientation?: "portrait" | "landscape";
  /** Tamanho da página */
  pageSize?: "a4" | "letter" | "legal";
  /** Se deve incluir logo */
  includeLogo?: boolean;
  /** URL da logo */
  logoUrl?: string;
  /** Se deve incluir rodapé com data/paginação */
  includeFooter?: boolean;
  /** Informações adicionais no cabeçalho */
  headerInfo?: Record<string, string>;
  /** Cor do tema (para cabeçalhos) */
  themeColor?: string;
}

/**
 * Dados parseados de arquivo
 */
export interface ParsedFileData {
  /** Linhas de dados parseadas */
  rows: Record<string, any>[];
  /** Colunas detectadas */
  columns: string[];
  /** Tipo de arquivo */
  fileType: ImportFileType;
  /** Nome do arquivo */
  fileName: string;
  /** Tamanho do arquivo (bytes) */
  fileSize: number;
  /** Metadados adicionais */
  metadata?: Record<string, any>;
}

/**
 * Template de importação pré-configurado
 */
export interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  entityType: EntityType;
  columnMappings: ColumnMapping[];
  sampleData?: Record<string, any>[];
  createdAt: string;
  updatedAt: string;
}

// ==================== CONFIGURAÇÕES ====================

/**
 * Mapeamentos padrão para cada tipo de entidade
 */
export const DEFAULT_COLUMN_MAPPINGS: Record<EntityType, ColumnMapping[]> = {
  leads: [
    {
      sourceColumn: "Nome",
      targetField: "name",
      required: true,
      validations: [{ type: "required", message: "Nome é obrigatório" }],
    },
    {
      sourceColumn: "Email",
      targetField: "email",
      required: true,
      validations: [
        { type: "required", message: "Email é obrigatório" },
        { type: "email", message: "Email inválido" },
      ],
    },
    {
      sourceColumn: "Telefone",
      targetField: "phone",
      validations: [{ type: "phone", message: "Telefone inválido" }],
    },
    {
      sourceColumn: "Empresa",
      targetField: "company_name",
    },
    {
      sourceColumn: "Cargo",
      targetField: "job_title",
    },
    {
      sourceColumn: "LinkedIn",
      targetField: "linkedin_url",
      validations: [{ type: "url", message: "URL inválida" }],
    },
    {
      sourceColumn: "Status",
      targetField: "status",
      defaultValue: "new",
      validations: [
        {
          type: "enum",
          message: "Status inválido",
          options: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"],
        },
      ],
    },
  ],
  companies: [
    {
      sourceColumn: "Nome",
      targetField: "name",
      required: true,
      validations: [{ type: "required", message: "Nome é obrigatório" }],
    },
    {
      sourceColumn: "Website",
      targetField: "website",
      validations: [{ type: "url", message: "URL inválida" }],
    },
    {
      sourceColumn: "Setor",
      targetField: "industry",
    },
    {
      sourceColumn: "Tamanho",
      targetField: "size",
    },
    {
      sourceColumn: "Telefone",
      targetField: "phone",
      validations: [{ type: "phone", message: "Telefone inválido" }],
    },
    {
      sourceColumn: "Email",
      targetField: "email",
      validations: [{ type: "email", message: "Email inválido" }],
    },
    {
      sourceColumn: "Endereço",
      targetField: "address",
    },
  ],
  deals: [
    {
      sourceColumn: "Título",
      targetField: "title",
      required: true,
      validations: [{ type: "required", message: "Título é obrigatório" }],
    },
    {
      sourceColumn: "Valor",
      targetField: "value",
      transform: (value) => parseFloat(String(value).replace(/[^0-9.-]/g, "")),
      validations: [{ type: "number", message: "Valor deve ser um número" }],
    },
    {
      sourceColumn: "Empresa",
      targetField: "company_name",
    },
    {
      sourceColumn: "Previsão de Fechamento",
      targetField: "expected_close_date",
      validations: [{ type: "date", message: "Data inválida" }],
    },
    {
      sourceColumn: "Descrição",
      targetField: "description",
    },
  ],
  tasks: [
    {
      sourceColumn: "Título",
      targetField: "title",
      required: true,
      validations: [{ type: "required", message: "Título é obrigatório" }],
    },
    {
      sourceColumn: "Descrição",
      targetField: "description",
    },
    {
      sourceColumn: "Data de Vencimento",
      targetField: "due_date",
      validations: [{ type: "date", message: "Data inválida" }],
    },
    {
      sourceColumn: "Prioridade",
      targetField: "priority",
      defaultValue: "medium",
      validations: [
        {
          type: "enum",
          message: "Prioridade inválida",
          options: ["low", "medium", "high", "urgent"],
        },
      ],
    },
    {
      sourceColumn: "Status",
      targetField: "status",
      defaultValue: "todo",
      validations: [
        {
          type: "enum",
          message: "Status inválido",
          options: ["todo", "in_progress", "done", "cancelled"],
        },
      ],
    },
  ],
  meetings: [
    {
      sourceColumn: "Título",
      targetField: "title",
      required: true,
      validations: [{ type: "required", message: "Título é obrigatório" }],
    },
    {
      sourceColumn: "Tipo",
      targetField: "type",
      defaultValue: "video",
      validations: [
        {
          type: "enum",
          message: "Tipo inválido",
          options: ["video", "phone", "in_person", "other"],
        },
      ],
    },
    {
      sourceColumn: "Data/Hora Início",
      targetField: "start_time",
      required: true,
      validations: [
        { type: "required", message: "Data/hora de início é obrigatória" },
        { type: "date", message: "Data/hora inválida" },
      ],
    },
    {
      sourceColumn: "Data/Hora Fim",
      targetField: "end_time",
      required: true,
      validations: [
        { type: "required", message: "Data/hora de fim é obrigatória" },
        { type: "date", message: "Data/hora inválida" },
      ],
    },
    {
      sourceColumn: "Local",
      targetField: "location",
    },
    {
      sourceColumn: "Link",
      targetField: "meeting_link",
      validations: [{ type: "url", message: "URL inválida" }],
    },
  ],
};

/**
 * Colunas padrão para exportação de cada entidade
 */
export const DEFAULT_EXPORT_COLUMNS: Record<EntityType, ExportColumn[]> = {
  leads: [
    { field: "name", label: "Nome", width: 150 },
    { field: "email", label: "Email", width: 200 },
    { field: "phone", label: "Telefone", width: 120 },
    { field: "company_name", label: "Empresa", width: 150 },
    { field: "job_title", label: "Cargo", width: 120 },
    { field: "status", label: "Status", width: 100 },
    {
      field: "created_at",
      label: "Data de Criação",
      width: 120,
      format: (value) => new Date(value).toLocaleDateString("pt-BR"),
    },
  ],
  companies: [
    { field: "name", label: "Nome", width: 150 },
    { field: "website", label: "Website", width: 200 },
    { field: "industry", label: "Setor", width: 120 },
    { field: "size", label: "Tamanho", width: 100 },
    { field: "email", label: "Email", width: 200 },
    { field: "phone", label: "Telefone", width: 120 },
    {
      field: "created_at",
      label: "Data de Criação",
      width: 120,
      format: (value) => new Date(value).toLocaleDateString("pt-BR"),
    },
  ],
  deals: [
    { field: "title", label: "Título", width: 150 },
    { field: "company_name", label: "Empresa", width: 150 },
    {
      field: "value",
      label: "Valor",
      width: 100,
      align: "right",
      format: (value) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value || 0),
    },
    { field: "stage_name", label: "Etapa", width: 120 },
    {
      field: "expected_close_date",
      label: "Previsão de Fechamento",
      width: 150,
      format: (value) => (value ? new Date(value).toLocaleDateString("pt-BR") : "-"),
    },
    {
      field: "created_at",
      label: "Data de Criação",
      width: 120,
      format: (value) => new Date(value).toLocaleDateString("pt-BR"),
    },
  ],
  tasks: [
    { field: "title", label: "Título", width: 150 },
    { field: "priority", label: "Prioridade", width: 100 },
    { field: "status", label: "Status", width: 100 },
    {
      field: "due_date",
      label: "Vencimento",
      width: 120,
      format: (value) => (value ? new Date(value).toLocaleDateString("pt-BR") : "-"),
    },
    {
      field: "created_at",
      label: "Data de Criação",
      width: 120,
      format: (value) => new Date(value).toLocaleDateString("pt-BR"),
    },
  ],
  meetings: [
    { field: "title", label: "Título", width: 150 },
    { field: "type", label: "Tipo", width: 100 },
    {
      field: "start_time",
      label: "Data/Hora",
      width: 150,
      format: (value) => new Date(value).toLocaleString("pt-BR"),
    },
    { field: "location", label: "Local", width: 150 },
    { field: "status", label: "Status", width: 100 },
  ],
};

// ==================== HELPERS ====================

/**
 * Valida um valor contra uma regra de validação
 */
export const validateValue = (
  value: any,
  rule: ValidationRule
): { isValid: boolean; error?: string } => {
  switch (rule.type) {
    case "required":
      return {
        isValid: value !== null && value !== undefined && value !== "",
        error: rule.message || "Campo obrigatório",
      };

    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: !value || emailRegex.test(String(value)),
        error: rule.message || "Email inválido",
      };

    case "phone":
      const phoneRegex = /^[\d\s\-\(\)\+]+$/;
      return {
        isValid: !value || phoneRegex.test(String(value)),
        error: rule.message || "Telefone inválido",
      };

    case "url":
      try {
        if (!value) return { isValid: true };
        new URL(String(value));
        return { isValid: true };
      } catch {
        return { isValid: false, error: rule.message || "URL inválida" };
      }

    case "date":
      const date = new Date(value);
      return {
        isValid: !value || !isNaN(date.getTime()),
        error: rule.message || "Data inválida",
      };

    case "number":
      return {
        isValid: !value || !isNaN(Number(value)),
        error: rule.message || "Deve ser um número",
      };

    case "enum":
      return {
        isValid: !value || rule.options?.includes(value),
        error: rule.message || `Valor deve ser um de: ${rule.options?.join(", ")}`,
      };

    default:
      return { isValid: true };
  }
};

/**
 * Valida um registro completo contra mapeamentos de colunas
 */
export const validateRecord = (
  record: Record<string, any>,
  mappings: ColumnMapping[]
): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  const transformedData: Record<string, any> = {};

  for (const mapping of mappings) {
    let value = record[mapping.sourceColumn];

    // Aplicar transformação
    if (mapping.transform && value !== null && value !== undefined) {
      try {
        value = mapping.transform(value);
      } catch (error) {
        warnings[mapping.targetField] = `Erro na transformação: ${error}`;
      }
    }

    // Aplicar valor padrão se vazio
    if ((value === null || value === undefined || value === "") && mapping.defaultValue !== undefined) {
      value = mapping.defaultValue;
    }

    // Validar
    if (mapping.validations) {
      for (const validation of mapping.validations) {
        const result = validateValue(value, validation);
        if (!result.isValid) {
          errors[mapping.targetField] = result.error!;
          break;
        }
      }
    }

    transformedData[mapping.targetField] = value;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    transformedData,
  };
};

/**
 * Gera nome de arquivo para exportação
 */
export const generateExportFilename = (
  entityType: EntityType,
  format: ExportFileType
): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const extension = format === "excel" ? "xlsx" : format;
  return `${entityType}_${timestamp}.${extension}`;
};

/**
 * Formata tamanho de arquivo para exibição
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};
