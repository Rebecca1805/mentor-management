import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { DateRange } from "react-day-picker";

interface DashboardFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  selectedStatus: string[];
  onStatusChange: (status: string[]) => void;
  selectedAlunas: number[];
  onAlunasChange: (alunas: number[]) => void;
  selectedCursos: string[];
  onCursosChange: (cursos: string[]) => void;
  availableAlunas: { id: number; nome: string }[];
  availableCursos: string[];
  onReset: () => void;
}

export function DashboardFilters({
  dateRange,
  onDateRangeChange,
  selectedStatus,
  onStatusChange,
  selectedAlunas,
  onAlunasChange,
  selectedCursos,
  onCursosChange,
  availableAlunas,
  availableCursos,
  onReset,
}: DashboardFiltersProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [alunasOpen, setAlunasOpen] = useState(false);
  const [cursosOpen, setCursosOpen] = useState(false);

  const handleStatusToggle = (status: string) => {
    if (selectedStatus.includes(status)) {
      onStatusChange(selectedStatus.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatus, status]);
    }
  };

  const handleAlunaToggle = (id: number) => {
    if (selectedAlunas.includes(id)) {
      onAlunasChange(selectedAlunas.filter(a => a !== id));
    } else {
      onAlunasChange([...selectedAlunas, id]);
    }
  };

  const handleCursoToggle = (curso: string) => {
    if (selectedCursos.includes(curso)) {
      onCursosChange(selectedCursos.filter(c => c !== curso));
    } else {
      onCursosChange([...selectedCursos, curso]);
    }
  };

  const activeFiltersCount = 
    (dateRange.from ? 1 : 0) +
    selectedStatus.length +
    selectedAlunas.length +
    selectedCursos.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50"
    >
      <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs font-light">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      {/* Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-light rounded-xl border-border/50 hover:border-primary/50 transition-all",
              dateRange.from && "border-primary/50 bg-primary/5"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => onDateRangeChange(range as DateRange || { from: undefined, to: undefined })}
            initialFocus
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Status */}
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "font-light rounded-xl border-border/50 hover:border-primary/50 transition-all",
              selectedStatus.length > 0 && "border-primary/50 bg-primary/5"
            )}
          >
            Status
            {selectedStatus.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs font-light">
                {selectedStatus.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" align="start">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Status</h4>
            {["Ativa", "Inativa"].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={selectedStatus.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <label
                  htmlFor={`status-${status}`}
                  className="text-sm font-light cursor-pointer"
                >
                  {status}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Alunas */}
      <Popover open={alunasOpen} onOpenChange={setAlunasOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "font-light rounded-xl border-border/50 hover:border-primary/50 transition-all",
              selectedAlunas.length > 0 && "border-primary/50 bg-primary/5"
            )}
          >
            Alunas
            {selectedAlunas.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs font-light">
                {selectedAlunas.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 max-h-80 overflow-y-auto" align="start">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Alunas</h4>
            {availableAlunas.map((aluna) => (
              <div key={aluna.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`aluna-${aluna.id}`}
                  checked={selectedAlunas.includes(aluna.id)}
                  onCheckedChange={() => handleAlunaToggle(aluna.id)}
                />
                <label
                  htmlFor={`aluna-${aluna.id}`}
                  className="text-sm font-light cursor-pointer line-clamp-1"
                >
                  {aluna.nome}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Cursos */}
      <Popover open={cursosOpen} onOpenChange={setCursosOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "font-light rounded-xl border-border/50 hover:border-primary/50 transition-all",
              selectedCursos.length > 0 && "border-primary/50 bg-primary/5"
            )}
          >
            Cursos
            {selectedCursos.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs font-light">
                {selectedCursos.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 max-h-80 overflow-y-auto" align="start">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Cursos</h4>
            {availableCursos.map((curso) => (
              <div key={curso} className="flex items-center space-x-2">
                <Checkbox
                  id={`curso-${curso}`}
                  checked={selectedCursos.includes(curso)}
                  onCheckedChange={() => handleCursoToggle(curso)}
                />
                <label
                  htmlFor={`curso-${curso}`}
                  className="text-sm font-light cursor-pointer line-clamp-1"
                >
                  {curso}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Reset Button */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="font-light rounded-xl text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
