import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useVendas, Venda } from "@/hooks/useAlunas";
import { useCreateVenda, useUpdateVenda, useDeleteVenda } from "@/hooks/useVendas";
import { VendaDialog } from "./VendaDialog";

interface VendasSectionProps {
  idAluna: number;
}

export const VendasSection = ({ idAluna }: VendasSectionProps) => {
  const { data: vendas = [] } = useVendas(idAluna);
  const createVenda = useCreateVenda();
  const updateVenda = useUpdateVenda();
  const deleteVenda = useDeleteVenda();

  const [vendaDialogOpen, setVendaDialogOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [deletingVendaId, setDeletingVendaId] = useState<number | null>(null);

  const totalVendas = vendas.reduce((sum, v) => sum + v.valor_vendido, 0);

  const handleSaveVenda = (vendaData: Omit<Venda, 'id' | 'user_id' | 'created_at'>) => {
    if (editingVenda) {
      updateVenda.mutate({ id: editingVenda.id, ...vendaData });
    } else {
      createVenda.mutate(vendaData);
    }
    setEditingVenda(null);
  };

  const handleEditVenda = (venda: Venda) => {
    setEditingVenda(venda);
    setVendaDialogOpen(true);
  };

  const handleDeleteVenda = () => {
    if (deletingVendaId) {
      deleteVenda.mutate(deletingVendaId);
      setDeletingVendaId(null);
    }
  };

  const handleAddNew = () => {
    setEditingVenda(null);
    setVendaDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground font-light">Total de Vendas</p>
          <p className="text-2xl font-poppins font-semibold text-primary">
            R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button onClick={handleAddNew} variant="outline" size="sm" className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Venda
        </Button>
      </div>

      {vendas.length > 0 ? (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-light">Período</TableHead>
                <TableHead className="font-light">Produtos</TableHead>
                <TableHead className="text-right font-light">Valor</TableHead>
                <TableHead className="w-[100px] font-light">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell className="font-light">{venda.periodo}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {venda.produtos.length > 0 ? (
                        venda.produtos.map((prod, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs font-light">
                            {prod}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-light">
                    R$ {venda.valor_vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditVenda(venda)}
                        className="hover:scale-105 transition-transform"
                        aria-label="Editar venda"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingVendaId(venda.id)}
                        className="hover:scale-105 transition-transform"
                        aria-label="Excluir venda"
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
      ) : (
        <div className="empty-state py-8 border-2 border-dashed rounded-xl">
          <p className="empty-state-title">Nenhuma venda registrada</p>
          <p className="empty-state-description">Clique em "Adicionar Venda" para registrar a primeira venda</p>
        </div>
      )}

      <VendaDialog
        open={vendaDialogOpen}
        onOpenChange={setVendaDialogOpen}
        onSave={handleSaveVenda}
        venda={editingVenda}
        idAluna={idAluna}
      />

      <AlertDialog open={!!deletingVendaId} onOpenChange={() => setDeletingVendaId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-poppins font-light">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="font-light">
              Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-light">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteVenda} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-light"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
