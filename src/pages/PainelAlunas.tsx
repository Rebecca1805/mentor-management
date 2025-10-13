import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAluna, useCreateAluna, useUpdateAluna, useAlunas } from "@/hooks/useAlunas";
import { useCursos, useAlunoCursos, useCreateAlunoCurso, useUpdateAlunoCurso, useDeleteAlunoCurso } from "@/hooks/useCursos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Search, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { DifficultyTags } from "@/components/DifficultyTags";
import { ObservacoesTable } from "@/components/ObservacoesTable";
import { AlunaCard } from "@/components/AlunaCard";

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
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    status: "Ativo",
    principais_dificuldades: [] as string[],
  });

  const [novoCurso, setNovoCurso] = useState({
    id_curso: 0,
    data_compra: new Date().toISOString().split('T')[0],
    status_evolucao: 'nao_iniciado' as const,
  });

  const isEdit = !!id;

  // Carregar dados da aluna quando em modo de edição
  useEffect(() => {
    if (isEdit && aluna) {
      setFormData({
        nome: aluna.nome || "",
        email: aluna.email || "",
        status: aluna.status || "Ativo",
        principais_dificuldades: aluna.principais_dificuldades || [],
      });
    }
  }, [isEdit, aluna]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && aluna) {
        await updateAluna.mutateAsync({ 
          id: aluna.id, 
          previousStatus: aluna.status,
          ...formData 
        });
        toast.success("Aluno atualizado!");
        navigate("/painel-alunas?tab=buscar");
      } else {
        await createAluna.mutateAsync(formData);
        toast.success("Aluno cadastrado!");
        setFormData({ nome: "", email: "", status: "Ativo", principais_dificuldades: [] });
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    }
  };

  const handleAdicionarCurso = async () => {
    if (!aluna || !novoCurso.id_curso) {
      toast.error("Selecione um curso");
      return;
    }

    try {
      await createAlunoCurso.mutateAsync({
        id_aluna: aluna.id,
        id_curso: novoCurso.id_curso,
        data_compra: novoCurso.data_compra,
        status_evolucao: novoCurso.status_evolucao,
        id_versao: null,
      });
      setNovoCurso({
        id_curso: 0,
        data_compra: new Date().toISOString().split('T')[0],
        status_evolucao: 'nao_iniciado',
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar curso");
    }
  };

  const filteredAlunas = alunas?.filter((a) =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container-custom py-8">
      <Breadcrumb 
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Painel de Alunas", href: "/painel-alunas" },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buscar">Buscar Alunas</TabsTrigger>
            <TabsTrigger value="cadastrar">{isEdit ? "Editar" : "Cadastrar"} Aluno</TabsTrigger>
          </TabsList>

          <TabsContent value="buscar" className="space-y-6 mt-8">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <p>Carregando...</p>
              ) : (
                filteredAlunas.map((aluna, index) => (
                  <AlunaCard key={aluna.id} aluna={aluna} index={index} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="cadastrar" className="space-y-6 mt-8">
            <Card className="card-premium max-w-5xl">
              <CardContent className="pt-8">
                {isEdit && (
                  <div className="flex items-center justify-between mb-6 pb-6 border-b">
                    <h2 className="text-2xl font-poppins font-bold">Editar Aluno</h2>
                    <Button variant="ghost" onClick={() => navigate("/painel-alunas?tab=buscar")}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-poppins font-bold">Informações Básicas</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="status"
                          checked={formData.status === "Ativo"}
                          onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "Ativo" : "Inativo" })}
                        />
                        <Label htmlFor="status">{formData.status}</Label>
                      </div>
                    </div>
                  </div>

                  {isEdit && aluna && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-poppins font-bold">Cursos</h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Select
                            value={novoCurso.id_curso.toString()}
                            onValueChange={(v) => setNovoCurso({ ...novoCurso, id_curso: Number(v) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um curso" />
                            </SelectTrigger>
                            <SelectContent>
                              {cursos.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={novoCurso.data_compra}
                            onChange={(e) => setNovoCurso({ ...novoCurso, data_compra: e.target.value })}
                          />
                          <Button type="button" onClick={handleAdicionarCurso}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {alunoCursos.map((ac: any) => (
                            <div key={ac.id} className="flex items-center justify-between p-4 border rounded">
                              <div>
                                <p className="font-medium">{ac.cursos?.nome || "Curso"}</p>
                                <p className="text-sm text-muted-foreground">
                                  Compra: {new Date(ac.data_compra).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={ac.status_evolucao}
                                  onValueChange={(v) => updateAlunoCurso.mutate({ 
                                    id: ac.id, 
                                    status_evolucao: v as 'nao_iniciado' | 'em_andamento' | 'pausado' | 'concluido'
                                  })}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                    <SelectItem value="pausado">Pausado</SelectItem>
                                    <SelectItem value="concluido">Concluído</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteAlunoCurso.mutate(ac.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <h3 className="text-lg font-poppins font-bold">Principais Dificuldades</h3>
                    <DifficultyTags
                      tags={formData.principais_dificuldades}
                      onChange={(tags) => setFormData({ ...formData, principais_dificuldades: tags })}
                    />
                  </div>

                  {isEdit && aluna && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-poppins font-bold">Observações e Planos</h3>
                      <ObservacoesTable idAluna={aluna.id} />
                    </div>
                  )}

                  <div className="flex gap-4 justify-end">
                    <Button type="button" variant="outline" onClick={() => navigate("/painel-alunas?tab=buscar")}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
