import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAluna, useCreateAluna, useUpdateAluna, useAlunas, CursoAdquirido, getCursosConcluidos } from "@/hooks/useAlunas";
import { useCursos, useAlunoCursos, useCreateAlunoCurso, useUpdateAlunoCurso, useDeleteAlunoCurso, getVersaoVigenteParaData, useCursoVersoes } from "@/hooks/useCursos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Search, BookOpen, Calendar, Eye, Save, X, RotateCcw, Plus, Edit } from "lucide-react";
import { VendasSection } from "@/components/VendasSection";
import { toast } from "sonner";
import { DifficultyTags } from "@/components/DifficultyTags";
import { ObservacoesTable } from "@/components/ObservacoesTable";
import { AlunaCardSkeleton } from "@/components/LoadingSkeletons";
import { calcularTempoBase, formatarDataBR } from "@/lib/utils";


const CURSO_STATUS_LABELS = {
  nao_iniciado: "Não Iniciado",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  concluido: "Concluído",
};

export default function PainelAlunas() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "buscar";
  
  const { data: alunas, isLoading } = useAlunas();
  const { data: aluna } = useAluna(id ? Number(id) : undefined);
  const { data: cursos = [] } = useCursos();
  const { data: alunoCursos = [] } = useAlunoCursos(id ? Number(id) : 0);
  const createAluna = useCreateAluna();
  const updateAluna = useUpdateAluna();
  const createAlunoCurso = useCreateAlunoCurso();
  const updateAlunoCurso = useUpdateAlunoCurso();
  const deleteAlunoCurso = useDeleteAlunoCurso();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [cursoFilter, setCursoFilter] = useState<string[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cursos_adquiridos: [] as CursoAdquirido[],
    status: "Ativo",
    principais_dificuldades: [] as string[],
    observacoes_mentora: "",
    data_primeira_compra: "",
    data_ultima_compra: "",
    tempo_base: 0,
  });

  useEffect(() => {
    if (aluna) {
      setFormData({
        nome: aluna.nome,
        email: aluna.email,
        cursos_adquiridos: aluna.cursos_adquiridos || [],
        status: aluna.status,
        principais_dificuldades: aluna.principais_dificuldades || [],
        observacoes_mentora: aluna.observacoes_mentora || "",
        data_primeira_compra: aluna.data_primeira_compra || "",
        data_ultima_compra: aluna.data_ultima_compra || "",
        tempo_base: aluna.tempo_base,
      });
    }
  }, [aluna]);

  // Calculate tempo_base automatically based on data_primeira_compra and status
  const tempoBaseCalculado = useMemo(() => {
    const baseDateStr = formData.data_primeira_compra || aluna?.data_primeira_compra || null;
    return calcularTempoBase(baseDateStr, formData.status, aluna?.data_inativacao ?? null);
  }, [formData.data_primeira_compra, formData.status, aluna?.data_primeira_compra, aluna?.data_inativacao]);

  const filteredAlunas = useMemo(() => {
    if (!alunas) return [];

    return alunas.filter((aluna) => {
      const matchesSearch = aluna.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          aluna.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(aluna.status);
      const matchesCurso = cursoFilter.length === 0 || 
                          aluna.cursos_adquiridos.some(c => cursoFilter.includes(c.nome));
      
      const matchesDataInicio = !dataInicio || (aluna.data_cadastro && aluna.data_cadastro >= dataInicio);
      const matchesDataFim = !dataFim || (aluna.data_cadastro && aluna.data_cadastro <= dataFim);

      return matchesSearch && matchesStatus && matchesCurso && matchesDataInicio && matchesDataFim;
    });
  }, [alunas, searchTerm, statusFilter, cursoFilter, dataInicio, dataFim]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    // Validate: cursos_concluidos não pode exceder total de cursos com status concluído
    const cursosConcluidosCount = formData.cursos_adquiridos.filter(c => c.status === 'concluido').length;
    
    try {
      if (isEdit) {
        await updateAluna.mutateAsync({ 
          id: Number(id), 
          previousStatus: aluna?.status,
          ...formData,
          tempo_base: tempoBaseCalculado
        });
        toast.success("Aluno atualizado com sucesso!");
      } else {
        await createAluna.mutateAsync({
          ...formData,
          tempo_base: tempoBaseCalculado
        });
        toast.success("Aluno cadastrado com sucesso!");
      }
      
      // Reset form
      resetForm();
      
      // Switch to buscar tab
      setSearchParams({ tab: "buscar" });
    } catch (error) {
      toast.error("Erro ao salvar aluno");
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      cursos_adquiridos: [],
      status: "Ativo",
      principais_dificuldades: [],
      observacoes_mentora: "",
      data_primeira_compra: "",
      data_ultima_compra: "",
      tempo_base: 0,
    });
  };

  const toggleCursoStatus = (cursoNome: string, status: CursoAdquirido['status']) => {
    const cursoIndex = formData.cursos_adquiridos.findIndex(c => c.nome === cursoNome);
    
    if (cursoIndex >= 0) {
      // Update existing course
      const newCursos = [...formData.cursos_adquiridos];
      newCursos[cursoIndex] = { ...newCursos[cursoIndex], status };
      setFormData({ ...formData, cursos_adquiridos: newCursos });
    } else {
      // Add new course
      setFormData({
        ...formData,
        cursos_adquiridos: [...formData.cursos_adquiridos, { nome: cursoNome, status }]
      });
    }
  };

  const removeCurso = (cursoNome: string) => {
    setFormData({
      ...formData,
      cursos_adquiridos: formData.cursos_adquiridos.filter(c => c.nome !== cursoNome)
    });
  };

  const handleEdit = (alunaId: number) => {
    navigate(`/painel-alunas/${alunaId}?tab=cadastrar`);
  };

  const handleCancelEdit = () => {
    navigate("/painel-alunas?tab=cadastrar");
    resetForm();
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Painel Alunos", href: "/painel-alunas" },
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
          Painel Alunos
        </h1>
        <p className="text-muted-foreground font-light">
          Gerencie seus alunos de forma eficiente
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="cadastrar">Cadastrar / Editar</TabsTrigger>
          <TabsTrigger value="buscar">Buscar / Listar</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastrar" className="space-y-6 mt-8">
          <Card className="card-premium max-w-5xl">
            <CardContent className="pt-8">
              {isEdit && (
                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                  <div>
                    <h2 className="text-2xl font-poppins" style={{ fontWeight: 700 }}>Editar Aluno</h2>
                    <p className="text-sm text-muted-foreground font-light mt-1">
                      Atualize as informações do aluno
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
                  <h2 className="text-2xl font-poppins" style={{ fontWeight: 700 }}>Novo Aluno</h2>
                  <p className="text-sm text-muted-foreground font-light mt-1">
                    Preencha os dados para cadastrar um novo aluno
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
                        className="rounded-xl font-light"
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
                        className="rounded-xl font-light"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-light">Status</Label>
                    <div className="flex items-center space-x-3 h-10">
                      <Switch
                        id="status"
                        checked={formData.status === "Ativo"}
                        onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "Ativo" : "Inativo" })}
                      />
                      <Label htmlFor="status" className="font-light cursor-pointer">
                        {formData.status}
                      </Label>
                    </div>
                  </div>

                  {isEdit && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-light">Data de Cadastro</Label>
                        <Input
                          value={formatarDataBR(aluna?.data_cadastro)}
                          disabled
                          className="rounded-xl font-light bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-light">Tempo na Base (dias)</Label>
                        <Input
                          value={tempoBaseCalculado}
                          disabled
                          className="rounded-xl font-light bg-muted"
                        />
                        <p className="text-xs text-muted-foreground font-light">Calculado automaticamente</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cursos */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-poppins mb-2" style={{ fontWeight: 700 }}>Adicionar Curso</h3>
                    <p className="text-sm text-muted-foreground font-light mb-4">
                      Selecione os cursos que o aluno adquiriu
                    </p>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        const curso = cursos.find(c => c.nome === value);
                        if (curso && !formData.cursos_adquiridos.find(c => c.nome === value)) {
                          toggleCursoStatus(value, 'nao_iniciado');
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecione um curso para adicionar" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {cursos
                          .filter(curso => !formData.cursos_adquiridos.find(c => c.nome === curso.nome))
                          .map((curso) => (
                            <SelectItem key={curso.id} value={curso.nome}>
                              {curso.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Cursos Adquiridos e Evolução</h3>
                    
                    {formData.cursos_adquiridos.length === 0 ? (
                      <div className="p-8 text-center border-2 border-dashed rounded-2xl">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground font-light">
                          Nenhum curso adicionado ainda
                        </p>
                      </div>
                    ) : (
                      <>
                        {formData.cursos_adquiridos.map((cursoAdquirido) => {
                          const curso = cursos.find(c => c.nome === cursoAdquirido.nome);
                          return (
                            <div
                              key={cursoAdquirido.nome}
                              className="p-6 rounded-2xl border-2 bg-muted/30 border-primary/30"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <h4 className="font-light text-lg">{cursoAdquirido.nome}</h4>
                                    {curso?.descricao && (
                                      <p className="text-xs text-muted-foreground mt-1">{curso.descricao}</p>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs font-light">Status de Evolução</Label>
                                    <Select
                                      value={cursoAdquirido.status}
                                      onValueChange={(value) => toggleCursoStatus(cursoAdquirido.nome, value as CursoAdquirido['status'])}
                                    >
                                      <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-background z-50">
                                        <SelectItem value="nao_iniciado">{CURSO_STATUS_LABELS.nao_iniciado}</SelectItem>
                                        <SelectItem value="em_andamento">{CURSO_STATUS_LABELS.em_andamento}</SelectItem>
                                        <SelectItem value="pausado">{CURSO_STATUS_LABELS.pausado}</SelectItem>
                                        <SelectItem value="concluido">{CURSO_STATUS_LABELS.concluido}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCurso(cursoAdquirido.nome)}
                                  className="text-destructive shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}

                        <div className="p-4 bg-muted/50 rounded-xl">
                          <p className="text-sm font-light">
                            <span className="font-poppins" style={{ fontWeight: 700 }}>Total de cursos adquiridos:</span>{" "}
                            {formData.cursos_adquiridos.length}
                          </p>
                          <p className="text-sm font-light mt-1">
                            <span className="font-poppins" style={{ fontWeight: 700 }}>Cursos concluídos:</span>{" "}
                            {formData.cursos_adquiridos.filter(c => c.status === 'concluido').length}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Datas e Tempo */}
                <div className="space-y-6">
                  <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Histórico de Compras</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="data_primeira_compra" className="font-light">Primeira Compra</Label>
                      <Input
                        id="data_primeira_compra"
                        type="date"
                        value={formData.data_primeira_compra}
                        onChange={(e) => setFormData({ ...formData, data_primeira_compra: e.target.value })}
                        className="rounded-xl font-light"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data_ultima_compra" className="font-light">Última Compra</Label>
                      <Input
                        id="data_ultima_compra"
                        type="date"
                        value={formData.data_ultima_compra}
                        onChange={(e) => setFormData({ ...formData, data_ultima_compra: e.target.value })}
                        className="rounded-xl font-light"
                      />
                    </div>
                  </div>
                </div>

                {/* Dificuldades */}
                <div className="space-y-6">
                  <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Principais Dificuldades</h3>
                  <DifficultyTags
                    tags={formData.principais_dificuldades}
                    onChange={(tags) => setFormData({ ...formData, principais_dificuldades: tags })}
                  />
                </div>

                {/* Observações da Mentora - Tabela */}
                {(isEdit && id) && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Planos de Ação e Observações</h3>
                    <ObservacoesTable idAluna={Number(id)} />
                  </div>
                )}

                {/* Vendas - Seção */}
                {(isEdit && id) && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Vendas</h3>
                    <VendasSection idAluna={Number(id)} />
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" className="btn-gradient" disabled={createAluna.isPending || updateAluna.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Atualizar Aluno" : "Cadastrar Aluno"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                    Voltar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buscar" className="space-y-6 mt-8">
          {/* Filters */}
          <Card className="card-premium">
            <CardContent className="pt-8">
              <div className="space-y-4">
                <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Filtros</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl font-light"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-light">Período (Data Cadastro)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="rounded-xl font-light"
                        placeholder="De"
                      />
                      <Input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="rounded-xl font-light"
                        placeholder="Até"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <AlunaCardSkeleton count={6} />
          ) : filteredAlunas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="empty-state"
            >
              <Search className="empty-state-icon" />
              <h3 className="empty-state-title">Nenhum aluno encontrado</h3>
              <p className="empty-state-description">
                Tente ajustar os filtros ou cadastre um novo aluno
              </p>
              <Button 
                onClick={() => setSearchParams({ tab: "cadastrar" })} 
                className="mt-4 btn-gradient"
              >
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Aluno
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlunas.map((aluna) => {
              const cursosConcluidosCount = getCursosConcluidos(aluna);
              const progressoPercentual = aluna.cursos_adquiridos.length > 0
                ? (cursosConcluidosCount / aluna.cursos_adquiridos.length) * 100
                : 0;

              return (
                <Card key={aluna.id} className="card-premium flex flex-col">
                  <CardContent className="pt-8 flex-1">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                      <h3 className="text-lg font-poppins font-light mb-1 tracking-tight">{aluna.nome}</h3>
                          <p className="text-sm text-muted-foreground font-light">{aluna.email}</p>
                        </div>
                        <Badge
                          className={`badge-status ${
                            aluna.status === "Ativo"
                              ? "bg-success/10 text-success ring-success/20"
                              : "bg-muted text-muted-foreground ring-border"
                          }`}
                        >
                          {aluna.status}
                        </Badge>
                      </div>

                      {aluna.curso_atual && (
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          <span className="text-muted-foreground font-light truncate">
                            {aluna.curso_atual}
                          </span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-light">Progresso</span>
                          <span className="text-primary font-poppins font-semibold">{Math.round(progressoPercentual)}%</span>
                        </div>
                        <Progress value={progressoPercentual} className="h-2" />
                        <p className="text-xs text-muted-foreground font-light">
                          {cursosConcluidosCount} de {aluna.cursos_adquiridos.length} concluídos
                        </p>
                      </div>

                      {aluna.data_cadastro && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                          <Calendar className="h-3.5 w-3.5" />
                          <span title="Tempo desde a primeira compra">
                            {calcularTempoBase(aluna.data_primeira_compra, aluna.status, aluna.data_inativacao)} dias na base
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl font-light"
                      onClick={() => handleEdit(aluna.id)}
                      aria-label={`Editar ${aluna.nome}`}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      className="flex-1 btn-gradient"
                      onClick={() => navigate(`/aluna/${aluna.id}`)}
                      aria-label={`Ver detalhes de ${aluna.nome}`}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
