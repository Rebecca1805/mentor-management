import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ObservacaoMentora } from "@/hooks/useAlunas";

interface ObservacoesTableProps {
  observacoes: ObservacaoMentora[];
  onChange: (observacoes: ObservacaoMentora[]) => void;
}

export const ObservacoesTable = ({ observacoes, onChange }: ObservacoesTableProps) => {
  const addRow = () => {
    onChange([
      ...observacoes,
      {
        plano_acao: "",
        prazo_execucao: "",
        status: "iniciado",
        observacoes: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(observacoes.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof ObservacaoMentora, value: string) => {
    const newObservacoes = [...observacoes];
    newObservacoes[index] = { ...newObservacoes[index], [field]: value };
    onChange(newObservacoes);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="font-light">Observações da Mentora (Tabela)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Linha
        </Button>
      </div>

      {observacoes.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-xl">
          <p className="text-sm text-muted-foreground font-light">
            Nenhuma observação adicionada. Clique em "Adicionar Linha" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {observacoes.map((obs, index) => (
            <div
              key={index}
              className="p-6 border rounded-2xl space-y-4 bg-muted/30 relative"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(index)}
                className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                <div className="space-y-2">
                  <Label htmlFor={`plano_acao_${index}`} className="text-xs font-light">
                    Plano de Ação *
                  </Label>
                  <Input
                    id={`plano_acao_${index}`}
                    value={obs.plano_acao}
                    onChange={(e) => updateRow(index, "plano_acao", e.target.value)}
                    placeholder="Descreva o plano de ação"
                    className="rounded-xl font-light"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`prazo_execucao_${index}`} className="text-xs font-light">
                    Prazo de Execução
                  </Label>
                  <Input
                    id={`prazo_execucao_${index}`}
                    type="date"
                    value={obs.prazo_execucao}
                    onChange={(e) => updateRow(index, "prazo_execucao", e.target.value)}
                    className="rounded-xl font-light"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`status_${index}`} className="text-xs font-light">
                    Status *
                  </Label>
                  <Select
                    value={obs.status}
                    onValueChange={(value) => updateRow(index, "status", value)}
                  >
                    <SelectTrigger id={`status_${index}`} className="rounded-xl">
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
                  <Label htmlFor={`observacoes_${index}`} className="text-xs font-light">
                    Observações
                  </Label>
                  <Textarea
                    id={`observacoes_${index}`}
                    value={obs.observacoes}
                    onChange={(e) => updateRow(index, "observacoes", e.target.value)}
                    placeholder="Observações adicionais..."
                    rows={2}
                    className="rounded-xl font-light"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
