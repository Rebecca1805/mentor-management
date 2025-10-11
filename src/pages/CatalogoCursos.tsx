import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, BookOpen, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useCursos, useCreateCurso, useUpdateCurso, useDeleteCurso, useCursoVersoes, useCreateCursoVersao, useUpdateCursoVersao, useDeleteCursoVersao, Curso, CursoVersao } from "@/hooks/useCursos";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyStates";
import { format } from "date-fns";

const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

export default function CatalogoCursos() {
  const { data: cursos, isLoading: isLoadingCursos } = useCursos();
  const createCurso = useCreateCurso();
  const updateCurso = useUpdateCurso();
  const deleteCurso = useDeleteCurso();
  
  const [cursoSelecionado, setCursoSelecionado] = useState<number | null>(null);
  const { data: versoes, isLoading: isLoadingVersoes } = useCursoVersoes(cursoSelecionado || undefined);
  
  const createVersao = useCreateCursoVersao();
  const updateVersao = useUpdateCursoVersao();
  const deleteVersao = useDeleteCursoVersao();

  // Estados para modais
  const [dialogCursoOpen, setDialogCursoOpen] = useState(false);
  const [dialogVersaoOpen, setDialogVersaoOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [editingVersao, setEditingVersao] = useState<CursoVersao | null>(null);
  const [deleteConfirmCurso, setDeleteConfirmCurso] = useState<number | null>(null);
  const [deleteConfirmVersao, setDeleteConfirmVersao] = useState<number | null>(null);

  // Form states
  const [formCurso, setFormCurso] = useState({ nome: "", descricao: "" });
  const [formVersao, setFormVersao] = useState({ versao: "", data_inicio_vigencia: "", data_fim_vigencia: "" });

  const handleOpenCursoDialog = (curso?: Curso) => {
    if (curso) {
      setEditingCurso(curso);
      setFormCurso({ nome: curso.nome, descricao: curso.descricao || "" });
    } else {
      setEditingCurso(null);
      setFormCurso({ nome: "", descricao: "" });
    }
    setDialogCursoOpen(true);
  };

  const handleOpenVersaoDialog = (versao?: CursoVersao) => {
    if (!cursoSelecionado) return;
    
    if (versao) {
      setEditingVersao(versao);
      setFormVersao({
        versao: versao.versao,
        data_inicio_vigencia: versao.data_inicio_vigencia,
        data_fim_vigencia: versao.data_fim_vigencia || "",
      });
    } else {
      setEditingVersao(null);
      setFormVersao({ versao: "", data_inicio_vigencia: "", data_fim_vigencia: "" });
    }
    setDialogVersaoOpen(true);
  };

  const handleSaveCurso = async () => {
    if (!formCurso.nome.trim()) return;

    if (editingCurso) {
      await updateCurso.mutateAsync({ id: editingCurso.id, ...formCurso });
    } else {
      await createCurso.mutateAsync(formCurso);
    }
    
    setDialogCursoOpen(false);
    setFormCurso({ nome: "", descricao: "" });
  };

  const handleSaveVersao = async () => {
    if (!cursoSelecionado || !formVersao.versao.trim() || !formVersao.data_inicio_vigencia) return;

    const versaoData = {
      id_curso: cursoSelecionado,
      versao: formVersao.versao,
      data_inicio_vigencia: formVersao.data_inicio_vigencia,
      data_fim_vigencia: formVersao.data_fim_vigencia || null,
    };

    if (editingVersao) {
      await updateVersao.mutateAsync({ id: editingVersao.id, ...versaoData });
    } else {
      await createVersao.mutateAsync(versaoData);
    }
    
    setDialogVersaoOpen(false);
    setFormVersao({ versao: "", data_inicio_vigencia: "", data_fim_vigencia: "" });
  };

  const handleDeleteCurso = async (id: number) => {
    await deleteCurso.mutateAsync(id);
    setDeleteConfirmCurso(null);
    if (cursoSelecionado === id) {
      setCursoSelecionado(null);
    }
  };

  const handleDeleteVersao = async (id: number) => {
    await deleteVersao.mutateAsync(id);
    setDeleteConfirmVersao(null);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Catálogo de Cursos" },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light text-foreground">Catálogo de Cursos</h1>
              <p className="text-muted-foreground mt-1">Gerencie cursos e suas versões</p>
            </div>
            <Button onClick={() => handleOpenCursoDialog()} className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Novo Curso
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Lista de Cursos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Cursos
                </CardTitle>
                <CardDescription>Lista de todos os cursos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCursos ? (
                  <TableSkeleton />
                ) : !cursos || cursos.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="Nenhum curso cadastrado"
                    description="Adicione seu primeiro curso ao catálogo"
                    action={{ label: "Novo Curso", onClick: () => handleOpenCursoDialog() }}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cursos.map((curso) => (
                        <TableRow
                          key={curso.id}
                          className={cursoSelecionado === curso.id ? "bg-accent/50" : "cursor-pointer hover:bg-accent/30"}
                          onClick={() => setCursoSelecionado(curso.id)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{curso.nome}</p>
                              {curso.descricao && (
                                <p className="text-sm text-muted-foreground">{curso.descricao}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCursoDialog(curso);
                                }}
                                aria-label="Editar curso"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmCurso(curso.id);
                                }}
                                aria-label="Excluir curso"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Versões do Curso Selecionado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Versões
                </CardTitle>
                <CardDescription>
                  {cursoSelecionado
                    ? `Versões do curso "${cursos?.find(c => c.id === cursoSelecionado)?.nome}"`
                    : "Selecione um curso para ver suas versões"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!cursoSelecionado ? (
                  <EmptyState
                    icon={Calendar}
                    title="Nenhum curso selecionado"
                    description="Clique em um curso à esquerda para gerenciar suas versões"
                  />
                ) : isLoadingVersoes ? (
                  <TableSkeleton />
                ) : !versoes || versoes.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="Nenhuma versão cadastrada"
                    description="Adicione a primeira versão para este curso"
                    action={{ label: "Nova Versão", onClick: () => handleOpenVersaoDialog() }}
                  />
                ) : (
                  <>
                    <div className="mb-4">
                      <Button onClick={() => handleOpenVersaoDialog()} size="sm" className="btn-gradient">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Versão
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Versão</TableHead>
                          <TableHead>Vigência</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {versoes.map((versao) => {
                          const isVigente = !versao.data_fim_vigencia || new Date(versao.data_fim_vigencia) >= new Date();
                          return (
                            <TableRow key={versao.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{versao.versao}</span>
                                  {isVigente && <Badge variant="secondary">Vigente</Badge>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p>{format(new Date(versao.data_inicio_vigencia), "dd/MM/yyyy")}</p>
                                  {versao.data_fim_vigencia && (
                                    <p className="text-muted-foreground">
                                      até {format(new Date(versao.data_fim_vigencia), "dd/MM/yyyy")}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenVersaoDialog(versao)}
                                    aria-label="Editar versão"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteConfirmVersao(versao.id)}
                                    aria-label="Excluir versão"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Dialog Curso */}
        <Dialog open={dialogCursoOpen} onOpenChange={setDialogCursoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCurso ? "Editar Curso" : "Novo Curso"}</DialogTitle>
              <DialogDescription>
                {editingCurso ? "Atualize as informações do curso" : "Adicione um novo curso ao catálogo"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="nome">Nome do Curso *</Label>
                <Input
                  id="nome"
                  value={formCurso.nome}
                  onChange={(e) => setFormCurso({ ...formCurso, nome: e.target.value })}
                  placeholder="Ex: Mentoria Premium"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formCurso.descricao}
                  onChange={(e) => setFormCurso({ ...formCurso, descricao: e.target.value })}
                  placeholder="Descrição opcional do curso"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogCursoOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCurso} disabled={!formCurso.nome.trim()}>
                {editingCurso ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Versão */}
        <Dialog open={dialogVersaoOpen} onOpenChange={setDialogVersaoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVersao ? "Editar Versão" : "Nova Versão"}</DialogTitle>
              <DialogDescription>
                {editingVersao ? "Atualize as informações da versão" : "Adicione uma nova versão ao curso"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="versao">Versão *</Label>
                <Input
                  id="versao"
                  value={formVersao.versao}
                  onChange={(e) => setFormVersao({ ...formVersao, versao: e.target.value })}
                  placeholder="Ex: 2024.1"
                />
              </div>
              <div>
                <Label htmlFor="data_inicio">Data Início Vigência *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formVersao.data_inicio_vigencia}
                  onChange={(e) => setFormVersao({ ...formVersao, data_inicio_vigencia: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="data_fim">Data Fim Vigência</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formVersao.data_fim_vigencia}
                  onChange={(e) => setFormVersao({ ...formVersao, data_fim_vigencia: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Deixe em branco se não houver data fim</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogVersaoOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveVersao}
                disabled={!formVersao.versao.trim() || !formVersao.data_inicio_vigencia}
              >
                {editingVersao ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AlertDialog Delete Curso */}
        <AlertDialog open={!!deleteConfirmCurso} onOpenChange={() => setDeleteConfirmCurso(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este curso? Todas as versões e vínculos com alunos serão removidos.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirmCurso && handleDeleteCurso(deleteConfirmCurso)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AlertDialog Delete Versão */}
        <AlertDialog open={!!deleteConfirmVersao} onOpenChange={() => setDeleteConfirmVersao(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta versão? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirmVersao && handleDeleteVersao(deleteConfirmVersao)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
