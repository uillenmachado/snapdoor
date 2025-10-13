// @ts-nocheck
/**
 * Import Service
 * 
 * Service layer para importação de dados de CSV e Excel.
 * Inclui parsing, validação e importação em lote.
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import type {
  ImportConfig,
  ImportFileType,
  ImportProgress,
  ImportResult,
  ImportStatus,
  ParsedFileData,
  EntityType,
  ValidationResult,
  ColumnMapping,
} from "@/types/import-export";
import { validateRecord } from "@/types/import-export";

// ==================== FILE PARSING ====================

/**
 * Parse arquivo CSV
 */
export const parseCSVFile = (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve({
          rows: results.data as Record<string, any>[],
          columns: results.meta.fields || [],
          fileType: "csv",
          fileName: file.name,
          fileSize: file.size,
          metadata: {
            errors: results.errors,
            meta: results.meta,
          },
        });
      },
      error: (error) => {
        reject(new Error(`Erro ao parsear CSV: ${error.message}`));
      },
    });
  });
};

/**
 * Parse arquivo Excel
 */
export const parseExcelFile = async (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Pegar primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        }) as any[][];

        if (jsonData.length === 0) {
          reject(new Error("Planilha vazia"));
          return;
        }

        // Primeira linha como cabeçalhos
        const headers = jsonData[0] as string[];
        
        // Converter linhas em objetos
        const rows = jsonData.slice(1).map((row) => {
          const obj: Record<string, any> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });

        resolve({
          rows,
          columns: headers,
          fileType: "excel",
          fileName: file.name,
          fileSize: file.size,
          metadata: {
            sheetName,
            totalSheets: workbook.SheetNames.length,
          },
        });
      } catch (error: any) {
        reject(new Error(`Erro ao parsear Excel: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Parse arquivo baseado no tipo
 */
export const parseFile = async (
  file: File,
  fileType: ImportFileType
): Promise<ParsedFileData> => {
  if (fileType === "csv") {
    return parseCSVFile(file);
  } else if (fileType === "excel") {
    return parseExcelFile(file);
  } else {
    throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
  }
};

// ==================== VALIDATION ====================

/**
 * Valida todos os registros de um arquivo parseado
 */
export const validateParsedData = (
  parsedData: ParsedFileData,
  columnMappings: ColumnMapping[]
): {
  validRecords: Array<{ row: number; data: Record<string, any> }>;
  invalidRecords: Array<{
    row: number;
    data: Record<string, any>;
    errors: Record<string, string>;
    warnings: Record<string, string>;
  }>;
} => {
  const validRecords: Array<{ row: number; data: Record<string, any> }> = [];
  const invalidRecords: Array<{
    row: number;
    data: Record<string, any>;
    errors: Record<string, string>;
    warnings: Record<string, string>;
  }> = [];

  parsedData.rows.forEach((row, index) => {
    const validation = validateRecord(row, columnMappings);

    if (validation.isValid) {
      validRecords.push({
        row: index + 1,
        data: validation.transformedData,
      });
    } else {
      invalidRecords.push({
        row: index + 1,
        data: row,
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }
  });

  return { validRecords, invalidRecords };
};

// ==================== DUPLICATE CHECK ====================

/**
 * Verifica duplicatas no banco de dados
 */
export const checkDuplicates = async (
  entityType: EntityType,
  records: Array<{ row: number; data: Record<string, any> }>,
  checkField: string,
  userId: string
): Promise<{
  unique: Array<{ row: number; data: Record<string, any> }>;
  duplicates: Array<{ row: number; data: Record<string, any>; existingId: string }>;
}> => {
  const unique: Array<{ row: number; data: Record<string, any> }> = [];
  const duplicates: Array<{ row: number; data: Record<string, any>; existingId: string }> = [];

  // Buscar valores existentes
  const valuesToCheck = records.map((r) => r.data[checkField]).filter(Boolean);

  if (valuesToCheck.length === 0) {
    return { unique: records, duplicates: [] };
  }

  const { data: existingRecords } = await supabase
    .from(entityType)
    .select(`id, ${checkField}`)
    .eq("user_id", userId)
    .in(checkField, valuesToCheck);

  const existingMap = new Map(
    existingRecords?.map((r) => [r[checkField], r.id]) || []
  );

  records.forEach((record) => {
    const value = record.data[checkField];
    const existingId = value ? existingMap.get(value) : null;

    if (existingId) {
      duplicates.push({ ...record, existingId });
    } else {
      unique.push(record);
    }
  });

  return { unique, duplicates };
};

// ==================== BATCH IMPORT ====================

/**
 * Importa registros em lote
 */
export const batchImport = async (
  entityType: EntityType,
  records: Array<{ row: number; data: Record<string, any> }>,
  userId: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  const startTime = Date.now();
  const createdIds: string[] = [];
  const errors: Array<{
    row: number;
    data: Record<string, any>;
    errors: Record<string, string>;
  }> = [];

  const total = records.length;
  let processed = 0;

  // Processar em batches de 50
  const batchSize = 50;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    // Adicionar user_id a cada registro
    const batchData = batch.map((record) => ({
      ...record.data,
      user_id: userId,
    }));

    try {
      const { data, error } = await supabase
        .from(entityType)
        .insert(batchData)
        .select("id");

      if (error) {
        // Se batch inteiro falhar, tentar um por um
        for (const record of batch) {
          try {
            const { data: singleData, error: singleError } = await supabase
              .from(entityType)
              .insert({ ...record.data, user_id: userId })
              .select("id")
              .single();

            if (singleError) {
              errors.push({
                row: record.row,
                data: record.data,
                errors: { _error: singleError.message },
              });
            } else if (singleData) {
              createdIds.push(singleData.id);
            }
          } catch (err: any) {
            errors.push({
              row: record.row,
              data: record.data,
              errors: { _error: err.message },
            });
          }
          processed++;
        }
      } else if (data) {
        createdIds.push(...data.map((d) => d.id));
        processed += batch.length;
      }

      // Reportar progresso
      if (onProgress) {
        const percentage = Math.round((processed / total) * 100);
        onProgress({
          total,
          processed,
          success: createdIds.length,
          failed: errors.length,
          skipped: 0,
          percentage,
          status: "processing",
          message: `Importando registros: ${processed}/${total}`,
        });
      }
    } catch (err: any) {
      // Batch inteiro falhou
      batch.forEach((record) => {
        errors.push({
          row: record.row,
          data: record.data,
          errors: { _error: err.message },
        });
      });
      processed += batch.length;
    }
  }

  const executionTime = Date.now() - startTime;
  const successfulImports = createdIds.length;
  const failedImports = errors.length;

  let status: ImportStatus;
  if (failedImports === 0) {
    status = "completed";
  } else if (successfulImports === 0) {
    status = "failed";
  } else {
    status = "partial";
  }

  return {
    status,
    totalRecords: total,
    successfulImports,
    failedImports,
    skippedRecords: 0,
    executionTime,
    createdIds,
    errors,
    warnings: [],
  };
};

/**
 * Atualiza registros existentes em lote
 */
export const batchUpdate = async (
  entityType: EntityType,
  records: Array<{ row: number; data: Record<string, any>; existingId: string }>,
  userId: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<{
  updatedIds: string[];
  errors: Array<{ row: number; data: Record<string, any>; errors: Record<string, string> }>;
}> => {
  const updatedIds: string[] = [];
  const errors: Array<{
    row: number;
    data: Record<string, any>;
    errors: Record<string, string>;
  }> = [];

  const total = records.length;
  let processed = 0;

  // Atualizar um por um (batch update não é trivial no Supabase)
  for (const record of records) {
    try {
      const { error } = await supabase
        .from(entityType)
        .update(record.data)
        .eq("id", record.existingId)
        .eq("user_id", userId);

      if (error) {
        errors.push({
          row: record.row,
          data: record.data,
          errors: { _error: error.message },
        });
      } else {
        updatedIds.push(record.existingId);
      }
    } catch (err: any) {
      errors.push({
        row: record.row,
        data: record.data,
        errors: { _error: err.message },
      });
    }

    processed++;

    if (onProgress) {
      const percentage = Math.round((processed / total) * 100);
      onProgress({
        total,
        processed,
        success: updatedIds.length,
        failed: errors.length,
        skipped: 0,
        percentage,
        status: "processing",
        message: `Atualizando registros: ${processed}/${total}`,
      });
    }
  }

  return { updatedIds, errors };
};

// ==================== MAIN IMPORT FUNCTION ====================

/**
 * Executa importação completa
 */
export const executeImport = async (
  config: ImportConfig,
  userId: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    // 1. Parse arquivo
    if (onProgress) {
      onProgress({
        total: 0,
        processed: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        percentage: 0,
        status: "processing",
        message: "Lendo arquivo...",
      });
    }

    const parsedData = await parseFile(config.file, config.fileType);

    // 2. Validar dados
    if (onProgress) {
      onProgress({
        total: parsedData.rows.length,
        processed: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        percentage: 10,
        status: "processing",
        message: "Validando dados...",
      });
    }

    const { validRecords, invalidRecords } = validateParsedData(
      parsedData,
      config.columnMappings
    );

    let recordsToProcess = validRecords;
    let skippedCount = invalidRecords.length;

    // 3. Verificar duplicatas (se configurado)
    if (!config.allowDuplicates && config.duplicateCheckField) {
      if (onProgress) {
        onProgress({
          total: parsedData.rows.length,
          processed: 0,
          success: 0,
          failed: 0,
          skipped: skippedCount,
          percentage: 20,
          status: "processing",
          message: "Verificando duplicatas...",
        });
      }

      const { unique, duplicates } = await checkDuplicates(
        config.entityType,
        validRecords,
        config.duplicateCheckField,
        userId
      );

      if (config.updateExisting) {
        // Atualizar duplicatas
        const { updatedIds, errors: updateErrors } = await batchUpdate(
          config.entityType,
          duplicates,
          userId,
          onProgress
        );

        // Processar apenas os únicos para inserção
        recordsToProcess = unique;
        skippedCount += updateErrors.length;
      } else {
        // Pular duplicatas
        recordsToProcess = unique;
        skippedCount += duplicates.length;
      }
    }

    // 4. Importar registros
    if (onProgress) {
      onProgress({
        total: parsedData.rows.length,
        processed: 0,
        success: 0,
        failed: 0,
        skipped: skippedCount,
        percentage: 30,
        status: "processing",
        message: "Importando registros...",
      });
    }

    const result = await batchImport(
      config.entityType,
      recordsToProcess,
      userId,
      (progress) => {
        if (onProgress) {
          onProgress({
            ...progress,
            percentage: 30 + Math.round(progress.percentage * 0.7),
            skipped: skippedCount,
          });
        }
      }
    );

    // 5. Resultado final
    return {
      ...result,
      skippedRecords: skippedCount,
      errors: [...invalidRecords.map(r => ({ ...r, errors: r.errors })), ...result.errors],
    };
  } catch (error: any) {
    throw new Error(`Erro na importação: ${error.message}`);
  }
};

// ==================== PREVIEW ====================

/**
 * Gera preview da importação sem executar
 */
export const previewImport = async (
  config: ImportConfig,
  userId: string
): Promise<{
  parsedData: ParsedFileData;
  validation: {
    valid: number;
    invalid: number;
    invalidRecords: Array<{
      row: number;
      data: Record<string, any>;
      errors: Record<string, string>;
    }>;
  };
  duplicates?: {
    count: number;
    records: Array<{ row: number; data: Record<string, any> }>;
  };
}> => {
  // Parse arquivo
  const parsedData = await parseFile(config.file, config.fileType);

  // Validar
  const { validRecords, invalidRecords } = validateParsedData(
    parsedData,
    config.columnMappings
  );

  const result: any = {
    parsedData,
    validation: {
      valid: validRecords.length,
      invalid: invalidRecords.length,
      invalidRecords: invalidRecords.slice(0, 10), // Apenas primeiros 10 erros
    },
  };

  // Verificar duplicatas se configurado
  if (!config.allowDuplicates && config.duplicateCheckField) {
    const { duplicates } = await checkDuplicates(
      config.entityType,
      validRecords,
      config.duplicateCheckField,
      userId
    );

    result.duplicates = {
      count: duplicates.length,
      records: duplicates.slice(0, 10), // Apenas primeiros 10
    };
  }

  return result;
};
