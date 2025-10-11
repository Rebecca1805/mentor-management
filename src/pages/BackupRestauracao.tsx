import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { exportAllDataToCSV, exportAllDataToJSON, importData, parseCSV, ImportResult } from "@/utils/backupUtils";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

const TABLES = [
  { value: "alunas", label: "Alunos", keyField: "email" },
  { value: "observacoes_mentora", label: "Observações Mentora", keyField: "id" },
  { value: "planos_acao", label: "Planos de Ação", keyField: "id" },
  { value: "vendas", label: "Vendas", keyField: "id" },
];

export default function BackupRestauracao() {
  const navigate = useNavigate();
  const { data: roleData, isLoading: isLoadingRole } = useUserRole();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const isAdmin = roleData?.isAdmin ?? false;

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportAllDataToCSV();
      toast.success("Backup CSV exportado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao exportar CSV: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      await exportAllDataToJSON();
      toast.success("Backup JSON exportado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao exportar JSON: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResults([]);
      setShowResults(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedTable) {
      toast.error("Selecione um arquivo e uma tabela");
      return;
    }

    setIsImporting(true);
    try {
      const text = await selectedFile.text();
      let data: any[] = [];

      if (selectedFile.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else if (selectedFile.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        // Handle both single table and full backup formats
        data = Array.isArray(parsed) ? parsed : (parsed[selectedTable] || []);
      }

      if (data.length === 0) {
        toast.error("Nenhum dado encontrado no arquivo");
        setIsImporting(false);
        return;
      }

      const table = TABLES.find(t => t.value === selectedTable);
      const keyField = table?.keyField || 'id';

      const result = await importData(selectedTable, data, keyField);
      setImportResults([result]);
      setShowResults(true);

      const totalProcessed = result.inserted + result.updated;
      if (result.errors.length === 0) {
        toast.success(`Importação concluída! ${totalProcessed} registros processados.`);
      } else {
        toast.warning(`Importação com avisos: ${totalProcessed} processados, ${result.errors.length} erros.`);
      }
    } catch (error: any) {
      toast.error(`Erro ao importar: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadErrorLog = () => {
    const log = importResults
      .map(result => {
        const lines = [`\n=== ${result.table} ===`];
        lines.push(`Inseridos: ${result.inserted}`);
        lines.push(`Atualizados: ${result.updated}`);
        if (result.errors.length > 0) {
          lines.push("\nErros:");
          result.errors.forEach(error => lines.push(`  - ${error}`));
        }
        return lines.join('\n');
      })
      .join('\n\n');

    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import_log_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoadingRole) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-center font-poppins font-light">Acesso Negado</CardTitle>
            <CardDescription className="text-center font-light">
              Apenas administradoras podem acessar esta página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Backup & Restauração" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <Breadcrumb items={breadcrumbItems} />

      <div className="space-y-2">
        <h1 className="text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-poppins font-extralight">
          Backup & Restauração
        </h1>
        <p className="text-muted-foreground font-light">
          Exporte e importe dados do sistema com segurança
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins font-light text-lg">
              <Download className="h-5 w-5 text-primary" />
              Exportar Dados
            </CardTitle>
            <CardDescription className="font-light">
              Faça backup de todas as tabelas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="w-full"
              variant="outline"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Tudo (CSV)
            </Button>

            <Button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="w-full"
              variant="outline"
            >
              <FileJson className="mr-2 h-4 w-4" />
              Exportar Tudo (JSON)
            </Button>

            <p className="text-xs text-muted-foreground font-light mt-4">
              Os arquivos serão baixados em formato ZIP contendo todas as tabelas
            </p>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins font-light text-lg">
              <Upload className="h-5 w-5 text-secondary" />
              Importar Dados
            </CardTitle>
            <CardDescription className="font-light">
              Restaure dados de arquivos CSV ou JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table-select" className="font-light">Tabela de Destino</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger id="table-select">
                  <SelectValue placeholder="Selecione a tabela" />
                </SelectTrigger>
                <SelectContent>
                  {TABLES.map(table => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload" className="font-light">Arquivo (CSV ou JSON)</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {selectedFile && (
              <p className="text-sm text-muted-foreground font-light">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}

            <Button
              onClick={handleImport}
              disabled={isImporting || !selectedFile || !selectedTable}
              className="w-full btn-gradient"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Importando..." : "Importar Dados"}
            </Button>

            <p className="text-xs text-muted-foreground font-light">
              <strong>Nota:</strong> Alunos são identificados por email; demais por ID.
              Registros existentes serão atualizados.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Import Results */}
      <AlertDialog open={showResults} onOpenChange={setShowResults}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-poppins font-light">Relatório de Importação</AlertDialogTitle>
            <AlertDialogDescription className="font-light">
              Resultados detalhados da importação
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {importResults.map((result, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-poppins font-light flex items-center gap-2">
                    {result.table}
                    {result.errors.length === 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="font-light">Inseridos: <strong>{result.inserted}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-light">Atualizados: <strong>{result.updated}</strong></span>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <XCircle className="h-4 w-4" />
                        <span className="font-light">Erros: {result.errors.length}</span>
                      </div>
                      <div className="max-h-40 overflow-y-auto bg-destructive/5 rounded-lg p-3 space-y-1">
                        {result.errors.slice(0, 10).map((error, i) => (
                          <p key={i} className="text-xs font-light text-destructive">{error}</p>
                        ))}
                        {result.errors.length > 10 && (
                          <p className="text-xs font-light text-muted-foreground">
                            ... e mais {result.errors.length - 10} erros
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <AlertDialogFooter>
            {importResults.some(r => r.errors.length > 0) && (
              <Button variant="outline" onClick={downloadErrorLog}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Log de Erros
              </Button>
            )}
            <AlertDialogCancel className="font-light">Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
