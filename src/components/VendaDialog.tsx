import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Venda } from "@/hooks/useAlunas";

interface VendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (venda: Omit<Venda, 'id' | 'user_id' | 'created_at'>) => void;
  venda?: Venda | null;
  idAluna: number;
}

export const VendaDialog = ({ open, onOpenChange, onSave, venda, idAluna }: VendaDialogProps) => {
  const [formData, setFormData] = useState({
    periodo: "",
    valor_vendido: "",
    produtos: [] as string[],
    observacoes: "",
  });
  const [novoProduto, setNovoProduto] = useState("");

  useEffect(() => {
    if (venda) {
      setFormData({
        periodo: venda.periodo,
        valor_vendido: venda.valor_vendido.toString(),
        produtos: venda.produtos || [],
        observacoes: venda.observacoes || "",
      });
    } else {
      setFormData({
        periodo: "",
        valor_vendido: "",
        produtos: [],
        observacoes: "",
      });
    }
  }, [venda, open]);

  const handleAddProduto = () => {
    if (novoProduto.trim()) {
      setFormData({ ...formData, produtos: [...formData.produtos, novoProduto.trim()] });
      setNovoProduto("");
    }
  };

  const handleRemoveProduto = (index: number) => {
    setFormData({ ...formData, produtos: formData.produtos.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.periodo.trim()) {
      return;
    }
    
    if (!formData.valor_vendido || parseFloat(formData.valor_vendido) <= 0) {
      return;
    }
    
    onSave({
      id_aluna: idAluna,
      periodo: formData.periodo,
      valor_vendido: parseFloat(formData.valor_vendido),
      produtos: formData.produtos,
      observacoes: formData.observacoes || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-poppins font-light text-xl">
            {venda ? "Editar Venda" : "Adicionar Venda"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="periodo" className="font-light">Período *</Label>
            <Input
              id="periodo"
              placeholder="Ex: 2024-01 ou Janeiro/2024"
              value={formData.periodo}
              onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
              required
              className="rounded-xl font-light"
              aria-label="Período da venda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor" className="font-light">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.valor_vendido}
              onChange={(e) => setFormData({ ...formData, valor_vendido: e.target.value })}
              required
              className="rounded-xl font-light"
              aria-label="Valor da venda em reais"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-light">Produtos</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome do produto"
                value={novoProduto}
                onChange={(e) => setNovoProduto(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddProduto())}
                className="rounded-xl font-light"
                aria-label="Nome do produto"
              />
              <Button 
                type="button" 
                onClick={handleAddProduto} 
                size="icon" 
                variant="outline"
                className="rounded-xl"
                aria-label="Adicionar produto"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.produtos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.produtos.map((produto, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1 font-light">
                    {produto}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                      onClick={() => handleRemoveProduto(idx)}
                      aria-label={`Remover ${produto}`}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="font-light">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre a venda..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              className="rounded-xl font-light resize-none"
              aria-label="Observações da venda"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-light"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="btn-gradient"
            >
              {venda ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
