import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LucideIcon, Plus, Search, ShoppingCart, FileText, Users } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon = FileText, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="empty-state"
    >
      <Icon className="empty-state-icon" />
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-4 btn-gradient"
          aria-label={action.label}
        >
          <Plus className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

export function NoAlunasFound() {
  return (
    <EmptyState
      icon={Search}
      title="Nenhum aluno encontrado"
      description="Tente ajustar os filtros ou adicione um novo aluno ao sistema"
    />
  );
}

export function NoVendas({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Nenhuma venda registrada"
      description="Comece a registrar vendas para acompanhar o faturamento"
      action={onAdd ? { label: "Adicionar Venda", onClick: onAdd } : undefined}
    />
  );
}

export function NoObservacoes({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="Nenhuma observação registrada"
      description="Adicione observações para acompanhar o desenvolvimento do aluno"
      action={onAdd ? { label: "Nova Observação", onClick: onAdd } : undefined}
    />
  );
}

export function NoPlanos({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="Nenhum plano de ação"
      description="Crie planos de ação para estruturar o acompanhamento"
      action={onAdd ? { label: "Novo Plano", onClick: onAdd } : undefined}
    />
  );
}

export function NoAlunas({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="Nenhum aluno cadastrado"
      description="Adicione seu primeiro aluno para começar a gerenciar mentorias"
      action={onAdd ? { label: "Cadastrar Aluno", onClick: onAdd } : undefined}
    />
  );
}
