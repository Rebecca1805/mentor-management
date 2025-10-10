import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ObservacaoMentora, useObservacoesMentora, useCreateObservacaoMentora, useUpdateObservacaoMentora, useDeleteObservacaoMentora } from "@/hooks/useObservacoesMentora";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ObservacoesTableProps {
  idAluna: number;
}

const STATUS_LABELS = {
  iniciado: "Iniciado",
  em_andamento: "Em Andamento",
  cancelado: "Cancelado",
  interrompido: "Interrompido",
};

const STATUS_COLORS = {
  iniciado: "bg-blue-500/10 text-blue-500",
  em_andamento: "bg-yellow-500/10 text-yellow-500",
  cancelado: "bg-red-500/10 text-red-500",
  interrompido: "bg-gray-500/10 text-gray-500",
};

export const ObservacoesTable = ({ idAluna }: ObservacoesTableProps) => {
  const { data: observacoes = [], isLoading } = useObservacoesMentora(idAluna);
  const createObservacao = useCreateObservacaoMentora();
  const updateObservacao = useUpdateObservacaoMentora();
  const deleteObservacao = useDeleteObservacaoMentora();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    plano_acao: "",
    prazo_execucao: "",
    status: "iniciado" as ObservacaoMentora['status'],
    observacoes: "",
  });

  const resetForm = () => {
    setFormData({
      plano_acao: "",
      prazo_execucao: "",
      status: "iniciado",
      observacoes: "",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.plano_acao.trim()) {
      return;
    }

    if (editingId) {
      updateObservacao.mutate(
        { id: editingId, ...formData, prazo_execucao: formData.prazo_execucao || null, observacoes: formData.observacoes || null },
        { onSuccess: resetForm }
      );
    } else {
      createObservacao.mutate(
        { id_aluna: idAluna, ...formData, prazo_execucao: formData.prazo_execucao || null, observacoes: formData.observacoes || null },
        { onSuccess: resetForm }
      );
    }
  };

  const handleEdit = (obs: ObservacaoMentora) => {
    setFormData({
      plano_acao: obs.plano_acao,
      prazo_execucao: obs.prazo_execucao || "",
      status: obs.status,
      observacoes: obs.observacoes || "",
    });
    setEditingId(obs.id);
    setIsAdding(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteObservacao.mutate(deletingId);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando observações...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="font-light">Observações da Mentora</Label>
        {!isAdding && !editingId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Observação
          </Button>
        )}
      </div>

      {/* Form para Adicionar/Editar */}
      {(isAdding || editingId) && (
        <div className="p-6 border rounded-2xl space-y-4 bg-muted/30">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm">
              {editingId ? "Editar Observação" : "Nova Observação"}
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-light">Plano de Ação *</Label>
              <Input
                value={formData.plano_acao}
                onChange={(e) => setFormData({ ...formData, plano_acao: e.target.value })}
                placeholder="Descreva o plano de ação"
                className="rounded-xl font-light"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-light">Prazo de Execução</Label>
              <Input
                type="date"
                value={formData.prazo_execucao}
                onChange={(e) => setFormData({ ...formData, prazo_execucao: e.target.value })}
                className="rounded-xl font-light"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-light">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ObservacaoMentora['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciado">Iniciado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="interrompido">Interrompido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label className="text-xs font-light">Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={2}
                className="rounded-xl font-light"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={!formData.plano_acao.trim() || createObservacao.isPending || updateObservacao.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              {editingId ? "Atualizar" : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Tabela de Observações */}
      {observacoes.length === 0 && !isAdding ? (
        <div className="text-center py-8 border-2 border-dashed rounded-xl">
          <p className="text-sm text-muted-foreground font-light">
            Nenhuma observação adicionada. Clique em "Adicionar Observação" para começar.
          </p>
        </div>
      ) : observacoes.length > 0 ? (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano de Ação</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {observacoes.map((obs) => (
                <TableRow key={obs.id}>
                  <TableCell className="font-medium">{obs.plano_acao}</TableCell>
                  <TableCell>
                    {obs.prazo_execucao
                      ? new Date(obs.prazo_execucao).toLocaleDateString('pt-BR')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[obs.status]}>
                      {STATUS_LABELS[obs.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {obs.observacoes || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(obs)}
                        disabled={isAdding || !!editingId}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingId(obs.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta observação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
