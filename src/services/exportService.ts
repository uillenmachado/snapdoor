// @ts-nocheck
/**
 * Export Service
 * 
 * Service layer para exportação de dados em CSV, Excel e PDF.
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import type {
  ExportConfig,
  ExportColumn,
  EntityType,
  PDFExportConfig,
} from "@/types/import-export";
import { generateExportFilename } from "@/types/import-export";

// ==================== DATA FETCHING ====================

/**
 * Busca dados para exportação
 */
export const fetchDataForExport = async (
  entityType: EntityType,
  userId: string,
  filters?: Record<string, any>,
  orderBy?: { field: string; direction: "asc" | "desc" },
  limit?: number
): Promise<any[]> => {
  let query = supabase
    .from(entityType)
    .select("*")
    .eq("user_id", userId);

  // Aplicar filtros
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        query = query.eq(key, value);
      }
    });
  }

  // Aplicar ordenação
  if (orderBy) {
    query = query.order(orderBy.field, { ascending: orderBy.direction === "asc" });
  }

  // Aplicar limite
  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar dados: ${error.message}`);
  }

  return data || [];
};

// ==================== CSV EXPORT ====================

/**
 * Exporta dados para CSV
 */
export const exportToCSV = (
  data: any[],
  columns: ExportColumn[],
  includeHeaders: boolean = true
): string => {
  // Transformar dados conforme colunas configuradas
  const rows = data.map((record) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      const value = record[col.field];
      row[col.label] = col.format ? col.format(value, record) : value;
    });
    return row;
  });

  // Converter para CSV
  const csv = Papa.unparse(rows, {
    header: includeHeaders,
    columns: columns.map((col) => col.label),
  });

  return csv;
};

/**
 * Download arquivo CSV
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==================== EXCEL EXPORT ====================

/**
 * Exporta dados para Excel
 */
export const exportToExcel = (
  data: any[],
  columns: ExportColumn[],
  includeHeaders: boolean = true
): XLSX.WorkBook => {
  // Transformar dados
  const rows = data.map((record) => {
    const row: any[] = [];
    columns.forEach((col) => {
      const value = record[col.field];
      row.push(col.format ? col.format(value, record) : value);
    });
    return row;
  });

  // Adicionar cabeçalhos
  if (includeHeaders) {
    rows.unshift(columns.map((col) => col.label));
  }

  // Criar worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Aplicar larguras de coluna
  const colWidths = columns.map((col) => ({
    wch: col.width ? col.width / 10 : 15,
  }));
  worksheet["!cols"] = colWidths;

  // Criar workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

  return workbook;
};

/**
 * Download arquivo Excel
 */
export const downloadExcel = (workbook: XLSX.WorkBook, filename: string): void => {
  XLSX.writeFile(workbook, filename);
};

// ==================== PDF EXPORT ====================

/**
 * Exporta dados para PDF
 */
export const exportToPDF = (
  data: any[],
  columns: ExportColumn[],
  pdfConfig?: PDFExportConfig
): jsPDF => {
  const config = {
    title: "Relatório",
    subtitle: "",
    orientation: "landscape" as const,
    pageSize: "a4" as const,
    includeFooter: true,
    themeColor: "#3b82f6",
    ...pdfConfig,
  };

  // Criar documento
  const doc = new jsPDF({
    orientation: config.orientation,
    unit: "mm",
    format: config.pageSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 20;

  // ===== CABEÇALHO =====
  
  // Logo (se configurado)
  if (config.includeLogo && config.logoUrl) {
    // TODO: Implementar carregamento de logo
    // doc.addImage(logoUrl, 'PNG', 10, 10, 30, 30);
    currentY = 45;
  }

  // Título
  doc.setFontSize(20);
  doc.setTextColor(config.themeColor);
  doc.text(config.title, pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  // Subtítulo
  if (config.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(config.subtitle, pageWidth / 2, currentY, { align: "center" });
    currentY += 8;
  }

  // Informações adicionais do cabeçalho
  if (config.headerInfo) {
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    Object.entries(config.headerInfo).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 14, currentY);
      currentY += 5;
    });
  }

  currentY += 5;

  // ===== TABELA =====

  // Preparar dados da tabela
  const tableHeaders = columns.map((col) => col.label);
  const tableData = data.map((record) =>
    columns.map((col) => {
      const value = record[col.field];
      return col.format ? col.format(value, record) : String(value || "");
    })
  );

  // Configurar autoTable
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: currentY,
    theme: "striped",
    headStyles: {
      fillColor: config.themeColor,
      textColor: 255,
      fontStyle: "bold",
      halign: "left",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: columns.reduce((acc, col, index) => {
      acc[index] = {
        cellWidth: col.width ? col.width / 4 : "auto",
        halign: col.align || "left",
      };
      return acc;
    }, {} as Record<number, any>),
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Rodapé em cada página
      if (config.includeFooter) {
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);

        // Data de geração
        const dateStr = new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        doc.text(`Gerado em: ${dateStr}`, 14, footerY);

        // Paginação
        const pageStr = `Página ${data.pageNumber} de ${doc.getNumberOfPages()}`;
        doc.text(pageStr, pageWidth - 14, footerY, { align: "right" });
      }
    },
  });

  return doc;
};

/**
 * Download arquivo PDF
 */
export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};

// ==================== MAIN EXPORT FUNCTION ====================

/**
 * Executa exportação completa
 */
export const executeExport = async (
  config: ExportConfig,
  userId: string
): Promise<void> => {
  try {
    // 1. Buscar dados
    const data = await fetchDataForExport(
      config.entityType,
      config.userId,
      config.filters,
      config.orderBy,
      config.limit
    );

    if (data.length === 0) {
      throw new Error("Nenhum dado encontrado para exportar");
    }

    // 2. Gerar nome do arquivo
    const filename = config.filename || generateExportFilename(config.entityType, config.format);

    // 3. Exportar conforme formato
    switch (config.format) {
      case "csv": {
        const csv = exportToCSV(data, config.columns, config.includeHeaders);
        downloadCSV(csv, filename);
        break;
      }

      case "excel": {
        const workbook = exportToExcel(data, config.columns, config.includeHeaders);
        downloadExcel(workbook, filename);
        break;
      }

      case "pdf": {
        const doc = exportToPDF(data, config.columns, config.pdfConfig);
        downloadPDF(doc, filename);
        break;
      }

      default:
        throw new Error(`Formato não suportado: ${config.format}`);
    }
  } catch (error: any) {
    throw new Error(`Erro na exportação: ${error.message}`);
  }
};

// ==================== TEMPLATE EXPORTS ====================

/**
 * Gera arquivo CSV template para importação
 */
export const generateImportTemplate = (
  entityType: EntityType,
  columns: string[]
): string => {
  // Criar cabeçalhos
  const headers = columns;

  // Criar linha de exemplo
  const exampleRow: Record<string, string> = {};
  columns.forEach((col) => {
    exampleRow[col] = `exemplo_${col.toLowerCase().replace(/\s+/g, "_")}`;
  });

  // Converter para CSV
  const csv = Papa.unparse([exampleRow], {
    header: true,
    columns: headers,
  });

  return csv;
};

/**
 * Download template de importação
 */
export const downloadImportTemplate = (
  entityType: EntityType,
  columns: string[]
): void => {
  const csv = generateImportTemplate(entityType, columns);
  const filename = `template_${entityType}.csv`;
  downloadCSV(csv, filename);
};

// ==================== PREVIEW ====================

/**
 * Gera preview dos dados para exportação
 */
export const previewExport = async (
  config: ExportConfig,
  userId: string,
  previewLimit: number = 10
): Promise<{
  totalRecords: number;
  previewData: any[];
  columns: ExportColumn[];
}> => {
  // Buscar total de registros
  const totalData = await fetchDataForExport(
    config.entityType,
    userId,
    config.filters,
    config.orderBy
  );

  // Buscar dados de preview
  const previewData = await fetchDataForExport(
    config.entityType,
    userId,
    config.filters,
    config.orderBy,
    previewLimit
  );

  return {
    totalRecords: totalData.length,
    previewData,
    columns: config.columns,
  };
};

// ==================== BATCH EXPORTS ====================

/**
 * Exporta múltiplas entidades em um único arquivo Excel
 */
export const exportMultipleEntities = async (
  configs: Array<{ entityType: EntityType; columns: ExportColumn[] }>,
  userId: string,
  filename: string
): Promise<void> => {
  const workbook = XLSX.utils.book_new();

  for (const config of configs) {
    // Buscar dados
    const data = await fetchDataForExport(config.entityType, userId);

    // Transformar dados
    const rows = data.map((record) => {
      const row: any[] = [];
      config.columns.forEach((col) => {
        const value = record[col.field];
        row.push(col.format ? col.format(value, record) : value);
      });
      return row;
    });

    // Adicionar cabeçalhos
    rows.unshift(config.columns.map((col) => col.label));

    // Criar worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Adicionar ao workbook com nome da entidade
    const sheetName = config.entityType.charAt(0).toUpperCase() + config.entityType.slice(1);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  // Download
  downloadExcel(workbook, filename);
};
