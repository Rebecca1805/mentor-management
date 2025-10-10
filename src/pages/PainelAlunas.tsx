import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAluna, useCreateAluna, useUpdateAluna, useAlunas } from "@/hooks/useAlunas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, BookOpen, Calendar, Eye, Save, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const CURSOS_DISPONIVEIS = [
  "Curso de Marketing Digital",
  "Curso de Vendas Online",
  "Curso de Empreendedorismo",
  "Curso de Gestão de Negócios",
  "Curso de Instagram para Negócios",
  "Curso de Produtividade",
];

export default function PainelAlunas() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "buscar";
  
  const { data: alunas, isLoading } = useAlunas();
  const { data: aluna } = useAluna(id ? Number(id) : undefined);
  const createAluna = useCreateAluna();
  const updateAluna = useUpdateAluna();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const isEdit = !!id;

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

  const filteredAlunas = useMemo(() => {
    if (!alunas) return [];

    return alunas.filter((aluna) => {
      const matchesSearch = aluna.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          aluna.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || aluna.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [alunas, searchTerm, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    if (formData.cursos_concluidos > formData.cursos_adquiridos.length) {
      toast.error("Cursos concluídos não pode ser maior que cursos adquiridos");
      return;
    }

    try {
      if (isEdit) {
        await updateAluna.mutateAsync({ id: Number(id), ...formData });
        toast.success("Aluna atualizada com sucesso!");
      } else {
        await createAluna.mutateAsync(formData);
        toast.success("Aluna cadastrada com sucesso!");
      }
      
      // Reset form
      setFormData({
        nome: "",
        email: "",
        curso_atual: "",
        cursos_adquiridos: [],
        cursos_concluidos: 0,
        data_primeira_compra: "",
        data_ultima_compra: "",
        tempo_base: 0,
        status: "Ativa",
        principais_dificuldades: "",
        observacoes_mentora: "",
      });
      
      // Switch to buscar tab
      setSearchParams({ tab: "buscar" });
    } catch (error) {
      toast.error("Erro ao salvar aluna");
    }
  };

  const toggleCurso = (curso: string) => {
    setFormData(prev => ({
      ...prev,
      cursos_adquiridos: prev.cursos_adquiridos.includes(curso)
        ? prev.cursos_adquiridos.filter(c => c !== curso)
        : [...prev.cursos_adquiridos, curso]
    }));
  };

  const handleEdit = (alunaId: number) => {
    navigate(`/painel-alunas/${alunaId}?tab=cadastrar`);
  };

  const handleCancelEdit = () => {
    navigate("/painel-alunas?tab=cadastrar");
    setFormData({
      nome: "",
      email: "",
      curso_atual: "",
      cursos_adquiridos: [],
      cursos_concluidos: 0,
      data_primeira_compra: "",
      data_ultima_compra: "",
      tempo_base: 0,
      status: "Ativa",
      principais_dificuldades: "",
      observacoes_mentora: "",
    });
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Painel Alunas", href: "/painel-alunas" },
    { label: activeTab === "cadastrar" ? "Cadastrar" : "Buscar" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Breadcrumb items={breadcrumbItems} />

      <div className="space-y-2">
        <h1 className="text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-poppins" style={{ fontWeight: 700 }}>
          Painel Alunas
        </h1>
        <p className="text-muted-foreground font-light">
          Gerencie suas alunas de forma eficiente
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="cadastrar">Cadastrar / Editar</TabsTrigger>
          <TabsTrigger value="buscar">Buscar / Listar</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastrar" className="space-y-6 mt-8">
          <Card className="card-premium max-w-4xl">
            <CardContent className="pt-8">
              {isEdit && (
                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                  <div>
                    <h2 className="text-2xl font-poppins" style={{ fontWeight: 700 }}>Editar Aluna</h2>
                    <p className="text-sm text-muted-foreground font-light mt-1">
                      Atualize as informações da aluna
                    </p>
                  </div>
                  <Button variant="ghost" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Edição
                  </Button>
                </div>
              )}
              
              {!isEdit && (
                <div className="mb-6 pb-6 border-b">
                  <h2 className="text-2xl font-poppins" style={{ fontWeight: 700 }}>Nova Aluna</h2>
                  <p className="text-sm text-muted-foreground font-light mt-1">
                    Preencha os dados para cadastrar uma nova aluna
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informações Básicas */}
                <div className="space-y-6">
                  <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Informações Básicas</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="font-light">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-light">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="font-light">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativa">Ativa</SelectItem>
                          <SelectItem value="Inativa">Inativa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="curso_atual" className="font-light">Curso Atual</Label>
                      <Select value={formData.curso_atual} onValueChange={(value) => setFormData({ ...formData, curso_atual: value })}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Selecione um curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURSOS_DISPONIVEIS.map((curso) => (
                            <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Cursos */}
                <div className="space-y-6">
                  <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Cursos Adquiridos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CURSOS_DISPONIVEIS.map((curso) => (
                      <label
                        key={curso}
                        className="flex items-center space-x-3 p-4 rounded-xl border cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.cursos_adquiridos.includes(curso)}
                          onChange={() => toggleCurso(curso)}
                          className="rounded border-gray-300"
                        />
                        <span className="font-light">{curso}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cursos_concluidos" className="font-light">Cursos Concluídos</Label>
                    <Input
                      id="cursos_concluidos"
                      type="number"
                      min="0"
                      max={formData.cursos_adquiridos.length}
                      value={formData.cursos_concluidos}
                      onChange={(e) => setFormData({ ...formData, cursos_concluidos: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground font-light">
                      Máximo: {formData.cursos_adquiridos.length} (total de cursos adquiridos)
                    </p>
                  </div>
                </div>

                {/* Datas e Tempo */}
                <div className="space-y-6">
                  <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Histórico</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="data_primeira_compra" className="font-light">Primeira Compra</Label>
                      <Input
                        id="data_primeira_compra"
                        type="date"
                        value={formData.data_primeira_compra}
                        onChange={(e) => setFormData({ ...formData, data_primeira_compra: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data_ultima_compra" className="font-light">Última Compra</Label>
                      <Input
                        id="data_ultima_compra"
                        type="date"
                        value={formData.data_ultima_compra}
                        onChange={(e) => setFormData({ ...formData, data_ultima_compra: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempo_base" className="font-light">Tempo na Base (dias)</Label>
                      <Input
                        id="tempo_base"
                        type="number"
                        min="0"
                        value={formData.tempo_base}
                        onChange={(e) => setFormData({ ...formData, tempo_base: Number(e.target.value) })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-6">
                  <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Anotações</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="principais_dificuldades" className="font-light">Principais Dificuldades</Label>
                    <Textarea
                      id="principais_dificuldades"
                      value={formData.principais_dificuldades}
                      onChange={(e) => setFormData({ ...formData, principais_dificuldades: e.target.value })}
                      rows={4}
                      className="rounded-xl"
                      placeholder="Descreva as principais dificuldades da aluna..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes_mentora" className="font-light">Observações da Mentora</Label>
                    <Textarea
                      id="observacoes_mentora"
                      value={formData.observacoes_mentora}
                      onChange={(e) => setFormData({ ...formData, observacoes_mentora: e.target.value })}
                      rows={4}
                      className="rounded-xl"
                      placeholder="Adicione observações relevantes sobre a aluna..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" className="btn-gradient" disabled={createAluna.isPending || updateAluna.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Atualizar Aluna" : "Cadastrar Aluna"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buscar" className="space-y-6 mt-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Ativa">Ativa</SelectItem>
                <SelectItem value="Inativa">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlunas.map((aluna) => {
              const progressoPercentual = aluna.cursos_adquiridos.length > 0
                ? (aluna.cursos_concluidos / aluna.cursos_adquiridos.length) * 100
                : 0;

              return (
                <Card key={aluna.id} className="card-premium flex flex-col">
                  <CardContent className="pt-8 flex-1">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-poppins mb-1" style={{ fontWeight: 700 }}>{aluna.nome}</h3>
                          <p className="text-sm text-muted-foreground font-light">{aluna.email}</p>
                        </div>
                        <Badge
                          className={`badge-status ${
                            aluna.status === "Ativa"
                              ? "bg-success/10 text-success ring-success/20"
                              : "bg-muted text-muted-foreground ring-border"
                          }`}
                        >
                          {aluna.status}
                        </Badge>
                      </div>

                      {aluna.curso_atual && (
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground font-light">
                            Curso: <span className="text-foreground">{aluna.curso_atual}</span>
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-light">Progresso</span>
                          <span className="text-primary font-poppins" style={{ fontWeight: 700 }}>{Math.round(progressoPercentual)}%</span>
                        </div>
                        <Progress value={progressoPercentual} className="h-2" />
                        <p className="text-xs text-muted-foreground font-light">
                          {aluna.cursos_concluidos} de {aluna.cursos_adquiridos.length} cursos
                        </p>
                      </div>

                      {aluna.data_primeira_compra && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                          <Calendar className="h-4 w-4" />
                          <span>Cliente há {aluna.tempo_base} dias</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(aluna.id)}
                    >
                      Editar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/aluna/${aluna.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {filteredAlunas.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-light">
                Nenhuma aluna encontrada com os filtros selecionados.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
