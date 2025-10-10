import { useNavigate, useParams } from "react-router-dom";
import { useAluna, useCreateAluna, useUpdateAluna } from "@/hooks/useAlunas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const CURSOS_DISPONIVEIS = [
  "Curso de Marketing Digital",
  "Curso de Vendas Online",
  "Curso de Empreendedorismo",
  "Curso de Gestão de Negócios",
  "Curso de Instagram para Negócios",
  "Curso de Produtividade",
];

export default function AlunaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const { data: aluna } = useAluna(Number(id));
  const createAluna = useCreateAluna();
  const updateAluna = useUpdateAluna();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    curso_atual: "",
    cursos_adquiridos: [] as string[],
    cursos_concluidos: 0,
    data_primeira_compra: "",
    data_ultima_compra: "",
    tempo_base: 0,
    status: "Ativa",
    principais_dificuldades: "",
    observacoes_mentora: "",
  });

  useEffect(() => {
    if (aluna) {
      setFormData({
        nome: aluna.nome,
        email: aluna.email,
        curso_atual: aluna.curso_atual || "",
        cursos_adquiridos: aluna.cursos_adquiridos,
        cursos_concluidos: aluna.cursos_concluidos,
        data_primeira_compra: aluna.data_primeira_compra || "",
        data_ultima_compra: aluna.data_ultima_compra || "",
        tempo_base: aluna.tempo_base,
        status: aluna.status,
        principais_dificuldades: aluna.principais_dificuldades || "",
        observacoes_mentora: aluna.observacoes_mentora || "",
      });
    }
  }, [aluna]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email) {
      return;
    }

    if (formData.cursos_concluidos > formData.cursos_adquiridos.length) {
      return;
    }

    if (isEdit) {
      await updateAluna.mutateAsync({ id: Number(id), ...formData });
    } else {
      await createAluna.mutateAsync(formData);
    }
    
    navigate("/dashboard");
  };

  const toggleCurso = (curso: string) => {
    setFormData(prev => ({
      ...prev,
      cursos_adquiridos: prev.cursos_adquiridos.includes(curso)
        ? prev.cursos_adquiridos.filter(c => c !== curso)
        : [...prev.cursos_adquiridos, curso]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-4xl mx-auto"
    >
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="bg-card rounded-2xl p-8 shadow-elegant">
        <h1 className="text-3xl font-bold mb-8">
          {isEdit ? "Editar Aluna" : "Adicionar Nova Aluna"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="curso_atual">Curso Atual</Label>
              <Select
                value={formData.curso_atual}
                onValueChange={(value) => setFormData({ ...formData, curso_atual: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {CURSOS_DISPONIVEIS.map((curso) => (
                    <SelectItem key={curso} value={curso}>
                      {curso}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativa">Ativa</SelectItem>
                  <SelectItem value="Inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cursos_concluidos">Cursos Concluídos</Label>
              <Input
                id="cursos_concluidos"
                type="number"
                min="0"
                max={formData.cursos_adquiridos.length}
                value={formData.cursos_concluidos}
                onChange={(e) => setFormData({ ...formData, cursos_concluidos: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="tempo_base">Tempo na Base (dias)</Label>
              <Input
                id="tempo_base"
                type="number"
                min="0"
                value={formData.tempo_base}
                onChange={(e) => setFormData({ ...formData, tempo_base: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="data_primeira_compra">Data Primeira Compra</Label>
              <Input
                id="data_primeira_compra"
                type="date"
                value={formData.data_primeira_compra}
                onChange={(e) => setFormData({ ...formData, data_primeira_compra: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="data_ultima_compra">Data Última Compra</Label>
              <Input
                id="data_ultima_compra"
                type="date"
                value={formData.data_ultima_compra}
                onChange={(e) => setFormData({ ...formData, data_ultima_compra: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Cursos Adquiridos</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {CURSOS_DISPONIVEIS.map((curso) => (
                <Button
                  key={curso}
                  type="button"
                  variant={formData.cursos_adquiridos.includes(curso) ? "default" : "outline"}
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={() => toggleCurso(curso)}
                >
                  {curso}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="principais_dificuldades">Principais Dificuldades</Label>
            <Textarea
              id="principais_dificuldades"
              value={formData.principais_dificuldades}
              onChange={(e) => setFormData({ ...formData, principais_dificuldades: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="observacoes_mentora">Observações da Mentora</Label>
            <Textarea
              id="observacoes_mentora"
              value={formData.observacoes_mentora}
              onChange={(e) => setFormData({ ...formData, observacoes_mentora: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              {isEdit ? "Atualizar Aluna" : "Salvar Aluna"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
