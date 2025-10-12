import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useObservacoesMentora } from "@/hooks/useObservacoesMentora";
import { FileText } from "lucide-react";

interface ObservacoesTableReadOnlyProps {
  idAluna: number;
}

const STATUS_LABELS = {
  iniciado: "Iniciado",
  em_andamento: "Em Andamento",
  cancelado: "Cancelado",
  interrompido: "Interrompido",
  concluido: "Concluído",
};

const STATUS_COLORS = {
  iniciado: "bg-blue-500/10 text-blue-500",
  em_andamento: "bg-yellow-500/10 text-yellow-500",
  cancelado: "bg-red-500/10 text-red-500",
  interrompido: "bg-gray-500/10 text-gray-500",
  concluido: "bg-green-500/10 text-green-500",
};

export const ObservacoesTableReadOnly = ({ idAluna }: ObservacoesTableReadOnlyProps) => {
  const { data: observacoes = [], isLoading } = useObservacoesMentora(idAluna);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (observacoes.length === 0) {
    return (
      <div className="empty-state py-8 border-2 border-dashed rounded-xl">
        <FileText className="empty-state-icon" />
        <h3 className="empty-state-title">Nenhuma observação</h3>
        <p className="empty-state-description">
          Nenhuma observação foi registrada para este aluno
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-light">Plano de Ação</TableHead>
            <TableHead className="font-light">Prazo</TableHead>
            <TableHead className="font-light">Status</TableHead>
            <TableHead className="font-light">Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {observacoes.map((obs) => (
            <TableRow key={obs.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-light">{obs.plano_acao}</TableCell>
              <TableCell className="font-light">
                {obs.prazo_execucao
                  ? new Date(obs.prazo_execucao).toLocaleDateString('pt-BR')
                  : '-'}
              </TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[obs.status] + " font-light"}>
                  {STATUS_LABELS[obs.status]}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs font-light">
                {obs.observacoes || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
