import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAluna, useCreateAluna, useUpdateAluna, useDeleteAluna, useAlunas, CursoAdquirido, getCursosConcluidos } from "@/hooks/useAlunas";
import { useCursos, useAlunoCursos, useCreateAlunoCurso, useUpdateAlunoCurso, useDeleteAlunoCurso, getVersaoVigenteParaData, useCursoVersoes } from "@/hooks/useCursos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Search, BookOpen, Calendar, Eye, Save, X, RotateCcw, Plus, Edit, Trash2 } from "lucide-react";
import { VendasSection } from "@/components/VendasSection";
import { toast } from "sonner";
import { DifficultyTags } from "@/components/DifficultyTags";
import { ObservacoesTable } from "@/components/ObservacoesTable";
import { AlunaCardSkeleton } from "@/components/LoadingSkeletons";
import { calcularTempoBase, formatarDataBR } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


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
  const deleteAluna = useDeleteAluna();
  const createAlunoCurso = useCreateAlunoCurso();
  const updateAlunoCurso = useUpdateAlunoCurso();
  const deleteAlunoCurso = useDeleteAlunoCurso();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [cursoFilter, setCursoFilter] = useState<string[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [deletingAlunaId, setDeletingAlunaId] = useState<number | null>(null);
  
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    status: "Ativo",
    principais_dificuldades: [] as string[],
    observacoes_mentora: "",
  });

  useEffect(() => {
    if (aluna) {
      setFormData({
        nome: aluna.nome,
        email: aluna.email,
        status: aluna.status,
        principais_dificuldades: aluna.principais_dificuldades || [],
        observacoes_mentora: aluna.observacoes_mentora || "",
      });
    }
  }, [aluna]);

  // Calculate tempo_base automatically based on data_primeira_compra and status
  const tempoBaseCalculado = useMemo(() => {
    const baseDateStr = aluna?.data_primeira_compra || null;
    return calcularTempoBase(baseDateStr, formData.status, aluna?.data_inativacao ?? null, aluna?.data_ultima_compra || null);
  }, [formData.status, aluna?.data_primeira_compra, aluna?.data_inativacao, aluna?.data_ultima_compra]);

  const filteredAlunas = useMemo(() => {
    if (!alunas) return [];

    return alunas.filter((aluna) => {
      const matchesSearch = aluna.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          aluna.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(aluna.status);
      const matchesCurso = cursoFilter.length === 0 || 
                          (aluna.cursos_adquiridos || []).some(c => cursoFilter.includes(c.nome));
      
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

    try {
      if (isEdit) {
        // Calcular datas de compra baseado em alunoCursos
        const datas = (alunoCursos || [])
          .map((ac: any) => ac.data_compra)
          .filter((d: any) => !!d)
          .map((d: string) => new Date(d));
        const primeiraCompra = datas.length ? new Date(Math.min(...datas.map((d) => d.getTime()))).toISOString().substring(0,10) : null;
        const ultimaCompra = datas.length ? new Date(Math.max(...datas.map((d) => d.getTime()))).toISOString().substring(0,10) : null;
        const tempoBase = calcularTempoBase(primeiraCompra, formData.status, aluna?.data_inativacao ?? null, ultimaCompra);
        
        await updateAluna.mutateAsync({ 
          id: Number(id), 
          previousStatus: aluna?.status,
          nome: formData.nome,
          email: formData.email,
          status: formData.status,
          principais_dificuldades: formData.principais_dificuldades,
          observacoes_mentora: formData.observacoes_mentora,
          data_primeira_compra: primeiraCompra,
          data_ultima_compra: ultimaCompra,
          tempo_base: tempoBase,
        });
        toast.success("Aluno atualizado com sucesso!");
      } else {
        await createAluna.mutateAsync({
          ...formData,
          tempo_base: 0,
          data_primeira_compra: null,
          data_ultima_compra: null,
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
      status: "Ativo",
      principais_dificuldades: [],
      observacoes_mentora: "",
    });
  };

  const handleEdit = (alunaId: number) => {
    navigate(`/painel-alunas/${alunaId}?tab=cadastrar`);
  };

  const handleCancelEdit = () => {
    navigate("/painel-alunas?tab=cadastrar");
    resetForm();
  };

  const handleDeleteAluna = async () => {
    if (deletingAlunaId) {
      try {
        await deleteAluna.mutateAsync(deletingAlunaId);
        setDeletingAlunaId(null);
        navigate("/painel-alunas?tab=buscar");
      } catch (error) {
        // Erro já tratado pelo hook
      }
    }
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
                      {isEdit ? (
                        <Select
                          value=""
                          onValueChange={async (value) => {
                            const curso = cursos.find(c => c.nome === value);
                            if (!curso) return;
                            if (alunoCursos.some((ac: any) => ac.id_curso === curso.id)) return;
                            const today = new Date();
                            const yyyy = today.getFullYear();
                            const mm = String(today.getMonth() + 1).padStart(2, '0');
                            const dd = String(today.getDate()).padStart(2, '0');
                            await createAlunoCurso.mutateAsync({
                              id_aluna: Number(id),
                              id_curso: curso.id,
                              id_versao: null,
                              status_evolucao: 'nao_iniciado',
                              data_compra: `${yyyy}-${mm}-${dd}`,
                            } as any);
                          }}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Selecione um curso para adicionar" />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            {cursos
                              .filter(curso => !alunoCursos.some((ac: any) => ac.id_curso === curso.id))
                              .map((curso) => (
                                <SelectItem key={curso.id} value={curso.nome}>
                                  {curso.nome}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground font-light p-4 bg-muted/50 rounded-xl">
                          Os cursos podem ser adicionados após cadastrar o aluno
                        </p>
                      )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-poppins" style={{ fontWeight: 700 }}>Cursos Adquiridos e Evolução</h3>
                    
                    {isEdit ? (
                      alunoCursos.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed rounded-2xl">
                          <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground font-light">
                            Nenhum curso adicionado ainda
                          </p>
                        </div>
                      ) : (
                        <>
                          {alunoCursos.map((ac: any) => (
                            <div
                              key={ac.id}
                              className="p-6 rounded-2xl border-2 bg-muted/30 border-primary/30"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <h4 className="font-light text-lg">{ac.cursos?.nome || 'Curso'}</h4>
                                    {ac.cursos?.descricao && (
                                      <p className="text-xs text-muted-foreground mt-1">{ac.cursos.descricao}</p>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs font-light">Status de Evolução</Label>
                                      <Select
                                        value={ac.status_evolucao}
                                        onValueChange={(value) => updateAlunoCurso.mutateAsync({ id: ac.id, status_evolucao: value as any })}
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
                                    <div className="space-y-2">
                                      <Label className="text-xs font-light">Data de Contratação</Label>
                                      <Input
                                        type="date"
                                        value={ac.data_compra ? ac.data_compra.substring(0,10) : ''}
                                        onChange={(e) => updateAlunoCurso.mutateAsync({ id: ac.id, data_compra: e.target.value })}
                                        className="rounded-xl font-light"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteAlunoCurso.mutateAsync(ac.id)}
                                  className="text-destructive shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="p-4 bg-muted/50 rounded-xl">
                            <p className="text-sm font-light">
                              <span className="font-poppins" style={{ fontWeight: 700 }}>Total de cursos adquiridos:</span>{" "}
                              {alunoCursos.length}
                            </p>
                            <p className="text-sm font-light mt-1">
                              <span className="font-poppins" style={{ fontWeight: 700 }}>Cursos concluídos:</span>{" "}
                              {alunoCursos.filter((ac: any) => ac.status_evolucao === 'concluido').length}
                            </p>
                          </div>
                        </>
                      )
                    ) : (
                      <div className="p-8 text-center border-2 border-dashed rounded-2xl">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground font-light">
                          Cadastre o aluno primeiro para adicionar cursos
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Datas e Tempo - seção removida conforme solicitação do cliente */}

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
                  {isEdit && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => setDeletingAlunaId(Number(id))}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Aluno
                    </Button>
                  )}
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
                            {calcularTempoBase(aluna.data_primeira_compra, aluna.status, aluna.data_inativacao, aluna.data_ultima_compra)} dias na base
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

      {/* Alert Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingAlunaId} onOpenChange={() => setDeletingAlunaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aluno? Todas as informações relacionadas (vendas, observações, planos de ação) serão removidas permanentemente.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAluna}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
