import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { useCreateFichaCompartilhada } from "@/hooks/useFichasCompartilhadas";
import { toast } from "sonner";

interface CompartilharDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idAluna: number;
}

export const CompartilharDialog = ({ open, onOpenChange, idAluna }: CompartilharDialogProps) => {
  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createFicha = useCreateFichaCompartilhada();

  const handleGenerate = async () => {
    try {
      const data = await createFicha.mutateAsync({ idAluna, expiresInHours });
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/ficha-compartilhada/${data.token}`;
      setGeneratedLink(link);
      toast.success("Link gerado com sucesso!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setCopied(false);
    setExpiresInHours(24);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compartilhar Ficha</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!generatedLink ? (
            <>
              <div className="space-y-2">
                <Label>Tempo de Expiração</Label>
                <Select
                  value={expiresInHours.toString()}
                  onValueChange={(value) => setExpiresInHours(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="6">6 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="72">3 dias</SelectItem>
                    <SelectItem value="168">7 dias</SelectItem>
                    <SelectItem value="720">30 dias</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  O link será válido por {expiresInHours} hora(s) após a criação
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Link de Compartilhamento</Label>
                <div className="flex gap-2">
                  <Input value={generatedLink} readOnly className="flex-1" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Este link expira em {new Date(Date.now() + expiresInHours * 3600000).toLocaleString("pt-BR")}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!generatedLink ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} disabled={createFicha.isPending}>
                {createFicha.isPending ? "Gerando..." : "Gerar Link"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Fechar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
