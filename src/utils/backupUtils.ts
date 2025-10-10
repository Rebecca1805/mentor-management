import { supabase } from "@/integrations/supabase/client";
import JSZip from "jszip";

export interface BackupData {
  alunas: any[];
  observacoes_mentora: any[];
  planos_acao: any[];
  vendas: any[];
}

export interface ImportResult {
  table: string;
  inserted: number;
  updated: number;
  errors: string[];
}

export async function exportAllDataToCSV(): Promise<void> {
  const { data: alunas } = await supabase.from("alunas").select("*");
  const { data: observacoes } = await supabase.from("observacoes_mentora").select("*");
  const { data: planos } = await supabase.from("planos_acao").select("*");
  const { data: vendas } = await supabase.from("vendas").select("*");

  const tables = [
    { name: "alunas", data: alunas || [] },
    { name: "observacoes_mentora", data: observacoes || [] },
    { name: "planos_acao", data: planos || [] },
    { name: "vendas", data: vendas || [] },
  ];

  const zip = new JSZip();

  tables.forEach(({ name, data }) => {
    if (data.length > 0) {
      const csv = convertToCSV(data);
      zip.file(`${name}.csv`, csv);
    }
  });

  const content = await zip.generateAsync({ type: "blob" });
  downloadFile(content, `backup_${new Date().toISOString().split('T')[0]}.zip`, "application/zip");
}

export async function exportAllDataToJSON(): Promise<void> {
  const { data: alunas } = await supabase.from("alunas").select("*");
  const { data: observacoes } = await supabase.from("observacoes_mentora").select("*");
  const { data: planos } = await supabase.from("planos_acao").select("*");
  const { data: vendas } = await supabase.from("vendas").select("*");

  const backup: BackupData = {
    alunas: alunas || [],
    observacoes_mentora: observacoes || [],
    planos_acao: planos || [],
    vendas: vendas || [],
  };

  const json = JSON.stringify(backup, null, 2);
  const zip = new JSZip();
  zip.file("backup.json", json);

  const content = await zip.generateAsync({ type: "blob" });
  downloadFile(content, `backup_${new Date().toISOString().split('T')[0]}.zip`, "application/zip");
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      let value = row[header];
      
      // Handle arrays and objects
      if (Array.isArray(value) || typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string') {
        value = value.replace(/\"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
      }
      
      return value ?? '';
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

function downloadFile(content: Blob, fileName: string, mimeType: string): void {
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importData(
  tableName: string,
  data: any[],
  keyField: string = 'id'
): Promise<ImportResult> {
  const result: ImportResult = {
    table: tableName,
    inserted: 0,
    updated: 0,
    errors: [],
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    result.errors.push("Usuário não autenticado");
    return result;
  }

  // Process based on table name
  for (const row of data) {
    try {
      const rowData = { ...row, user_id: user.id };

      if (tableName === 'alunas') {
        const email = row.email as string;
        if (!email) {
          result.errors.push("Email não encontrado no registro");
          continue;
        }

        const { data: existing } = await supabase
          .from('alunas')
          .select('id')
          .eq('email', email)
          .limit(1);

        if (existing && existing.length > 0) {
          const { error } = await supabase.from('alunas').update(rowData).eq('email', email);
          error ? result.errors.push(`Erro: ${error.message}`) : result.updated++;
        } else {
          const { error } = await supabase.from('alunas').insert([rowData]);
          error ? result.errors.push(`Erro: ${error.message}`) : result.inserted++;
        }
      } else if (tableName === 'observacoes_mentora') {
        const id = row.id as string;
        if (!id) {
          const { error } = await supabase.from('observacoes_mentora').insert([rowData]);
          error ? result.errors.push(`Erro: ${error.message}`) : result.inserted++;
          continue;
        }

        const { data: existing } = await supabase
          .from('observacoes_mentora')
          .select('id')
          .eq('id', id)
          .limit(1);

        if (existing && existing.length > 0) {
          const { error } = await supabase.from('observacoes_mentora').update(rowData).eq('id', id);
          error ? result.errors.push(`Erro: ${error.message}`) : result.updated++;
        } else {
          const { error } = await supabase.from('observacoes_mentora').insert([rowData]);
          error ? result.errors.push(`Erro: ${error.message}`) : result.inserted++;
        }
      } else if (tableName === 'planos_acao') {
        const id = row.id as number;
        if (!id) {
          const { error } = await supabase.from('planos_acao').insert([rowData]);
          error ? result.errors.push(`Erro: ${error.message}`) : result.inserted++;
          continue;
        }

        const { data: existing } = await supabase
          .from('planos_acao')
          .select('id')
          .eq('id', id)
          .limit(1);

        if (existing && existing.length > 0) {
          const { error } = await supabase.from('planos_acao').update(rowData).eq('id', id);
          error ? result.errors.push(`Erro: ${error.message}`) : result.updated++;
        } else {
          const { error } = await supabase.from('planos_acao').insert([rowData]);
          error ? result.errors.push(`Erro: ${error.message}`) : result.inserted++;
        }
      } else if (tableName === 'vendas') {
        const id = row.id as number;
        if (!id) {
          const { error } = await supabase.from('vendas').insert([rowData]);
          error ? result.errors.push(`Erro: ${error.message}`) : result.inserted++;
          continue;
        }

        const { data: existing } = await supabase
          .from('vendas')
          .select('id')
          .eq('id', id)
          .limit(1);

        if (existing && existing.length > 0) {
          const { error } = await supabase.from('vendas').update(rowData).eq('id', id);
          error ? result.errors.push(`Erro: ${error.message}`) : result.updated++;
        } else {
          const { error } = await supabase.from('vendas').insert([rowData]);
          error ? result.errors.push(`Erro: ${error.message}`) : result.inserted++;
        }
      }
    } catch (error: any) {
      result.errors.push(`Erro inesperado: ${error.message}`);
    }
  }

  return result;
}

export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        let value = values[index];
        
        // Try to parse JSON arrays/objects
        if (value.startsWith('[') || value.startsWith('{')) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        
        row[header] = value === '' ? null : value;
      });
      data.push(row);
    }
  }

  return data;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
