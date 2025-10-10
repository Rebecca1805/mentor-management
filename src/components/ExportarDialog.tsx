import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet } from "lucide-react";
import { Aluna } from "@/hooks/useAlunas";
import { Venda } from "@/hooks/useAlunas";
import { ObservacaoMentora } from "@/hooks/useObservacoesMentora";
import { exportToPDF, exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

interface ExportarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aluna: Aluna;
  vendas: Venda[];
  observacoes: ObservacaoMentora[];
}

export const ExportarDialog = ({ open, onOpenChange, aluna, vendas, observacoes }: ExportarDialogProps) => {
  const handleExportPDF = async () => {
    try {
      await exportToPDF(aluna, vendas, observacoes);
      toast.success("PDF exportado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(aluna, vendas, observacoes);
      toast.success("CSV exportado com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao exportar CSV");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Exportar Ficha</DialogTitle>
          <DialogDescription>
            Escolha o formato para exportar a ficha de {aluna.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            onClick={handleExportPDF}
            className="h-auto flex-col items-start gap-2 p-4"
            variant="outline"
          >
            <div className="flex items-center gap-2 w-full">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Exportar como PDF</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Documento formatado com todas as informações, cursos, observações e vendas
            </p>
          </Button>

          <Button
            onClick={handleExportCSV}
            className="h-auto flex-col items-start gap-2 p-4"
            variant="outline"
          >
            <div className="flex items-center gap-2 w-full">
              <FileSpreadsheet className="h-5 w-5" />
              <span className="font-semibold">Exportar como CSV</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Planilha com dados tabulares para análise em Excel ou Google Sheets
            </p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
