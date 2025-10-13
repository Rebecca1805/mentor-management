import { useAllProfiles, useUpdateProfile, useDeleteProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, PauseCircle, UserCheck, Edit2, Save, X, Trash } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

type EditingState = {
  [userId: string]: {
    plan: string;
    expiresAt: string;
  };
};

export default function PainelMaster() {
  const { user } = useAuth();
  const { data: profiles = [], isLoading } = useAllProfiles();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();
  const [editingUsers, setEditingUsers] = useState<Record<string, boolean>>({});
  const [editingState, setEditingState] = useState<EditingState>({});

  const startEditing = (userId: string, currentPlan: string, currentExpiration: string | null) => {
    setEditingUsers(prev => ({ ...prev, [userId]: true }));
    setEditingState(prev => ({
      ...prev,
      [userId]: {
        plan: currentPlan || 'estrategico',
        expiresAt: currentExpiration 
          ? format(new Date(currentExpiration), 'yyyy-MM-dd')
          : format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      }
    }));
  };

  const cancelEditing = (userId: string) => {
    setEditingUsers(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
    setEditingState(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
  };

  const saveChanges = (userId: string, currentStatus: string) => {
    const state = editingState[userId];
    if (!state) return;

    updateProfile.mutate({
      userId,
      status: currentStatus as 'ativa' | 'suspensa' | 'inativa' | 'pendente',
      subscriptionPlan: state.plan,
      subscriptionExpiresAt: new Date(state.expiresAt).toISOString()
    });
    
    cancelEditing(userId);
  };

  const handleUpdateStatus = (userId: string, status: 'ativa' | 'suspensa' | 'inativa') => {
    const state = editingState[userId];
    const updateData: any = {
      userId,
      status,
      approvedBy: status === 'ativa' ? user?.id : undefined
    };

    if (status === 'ativa' && state) {
      updateData.subscriptionPlan = state.plan;
      updateData.subscriptionExpiresAt = new Date(state.expiresAt).toISOString();
    }

    updateProfile.mutate(updateData);
    cancelEditing(userId);
  };

  const handleDeleteProfile = (userId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta mentora? Esta ação não pode ser desfeita.")) {
      deleteProfile.mutate(userId);
    }
  };

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      'estrategico': 'Estratégico',
      'condutor': 'Condutor',
      'visionario': 'Visionário'
    };
    return labels[plan] || plan;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { variant: "outline" as const, icon: PauseCircle, color: "text-yellow-600" },
      ativa: { variant: "default" as const, icon: CheckCircle, color: "text-success" },
      inativa: { variant: "secondary" as const, icon: XCircle, color: "text-muted-foreground" },
      suspensa: { variant: "destructive" as const, icon: XCircle, color: "text-destructive" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const pendentes = profiles.filter(p => p.status === 'pendente');
  const ativas = profiles.filter(p => p.status === 'ativa');
  const suspensas = profiles.filter(p => p.status === 'suspensa');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-poppins" style={{ fontWeight: 700 }}>
          Gerenciar Mentoras
        </h1>
        <p className="text-muted-foreground mt-2">
          Aprove, suspenda ou gerencie o acesso de mentoras à plataforma
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="card-premium border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-light text-muted-foreground flex items-center gap-2">
              <PauseCircle className="h-4 w-4 text-yellow-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-poppins font-semibold text-yellow-600">{pendentes.length}</p>
          </CardContent>
        </Card>

        <Card className="card-premium border-success/30">
          <CardHeader>
            <CardTitle className="text-sm font-light text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-poppins font-semibold text-success">{ativas.length}</p>
          </CardContent>
        </Card>

        <Card className="card-premium border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm font-light text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Suspensas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-poppins font-semibold text-destructive">{suspensas.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Mentoras */}
      <div className="space-y-4">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="card-premium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <h3 className="font-poppins font-semibold text-lg">{profile.full_name}</h3>
                      {getStatusBadge(profile.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <p>Cadastro: {format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                      {profile.approved_at && (
                        <p>Aprovada: {format(new Date(profile.approved_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                      )}
                      {!editingUsers[profile.user_id] ? (
                        <>
                          <p>Plano: <strong>{getPlanLabel(profile.subscription_plan)}</strong></p>
                          {profile.subscription_expires_at && (
                            <p>Expira: {format(new Date(profile.subscription_expires_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                          )}
                        </>
                      ) : null}
                    </div>

                    {/* Área de Edição */}
                    {editingUsers[profile.user_id] && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs font-light">Plano</Label>
                            <Select 
                              value={editingState[profile.user_id]?.plan || 'estrategico'} 
                              onValueChange={(value) => setEditingState(prev => ({
                                ...prev,
                                [profile.user_id]: { ...prev[profile.user_id], plan: value }
                              }))}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="estrategico">Estratégico ✅</SelectItem>
                                <SelectItem value="condutor" disabled>Condutor 🔒</SelectItem>
                                <SelectItem value="visionario" disabled>Visionário 🔒</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-light">Data de Expiração</Label>
                            <Input
                              type="date"
                              value={editingState[profile.user_id]?.expiresAt || ''}
                              onChange={(e) => setEditingState(prev => ({
                                ...prev,
                                [profile.user_id]: { ...prev[profile.user_id], expiresAt: e.target.value }
                              }))}
                              className="h-9"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {profile.status === 'pendente' ? (
                      <>
                        {!editingUsers[profile.user_id] ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(profile.user_id, 'estrategico', null)}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Configurar
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUpdateStatus(profile.user_id, 'ativa')}
                              className="btn-gradient"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelEditing(profile.user_id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateStatus(profile.user_id, 'inativa')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Recusar
                        </Button>
                      </>
                    ) : profile.status === 'ativa' ? (
                      <>
                        {!editingUsers[profile.user_id] ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(profile.user_id, profile.subscription_plan, profile.subscription_expires_at)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(profile.user_id, 'inativa')}
                            >
                              <PauseCircle className="h-4 w-4 mr-2" />
                              Desativar
                            </Button>
                          </>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => saveChanges(profile.user_id, profile.status)}
                              className="btn-gradient"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelEditing(profile.user_id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (profile.status === 'suspensa' || profile.status === 'inativa') ? (
                      <>
                        {!editingUsers[profile.user_id] ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(profile.user_id, profile.subscription_plan, profile.subscription_expires_at)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Configurar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProfile(profile.user_id)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Excluir
                            </Button>
                          </>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUpdateStatus(profile.user_id, 'ativa')}
                              className="btn-gradient"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reativar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelEditing(profile.user_id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {profiles.length === 0 && (
          <Card className="card-premium">
            <CardContent className="p-12 text-center">
              <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-poppins mb-2">Nenhuma mentora cadastrada</h3>
              <p className="text-muted-foreground">
                Aguarde o cadastro de novas mentoras para gerenciar seus acessos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
