import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AlunaDetalhes from "./pages/AlunaDetalhes";
import FichaAlunaVisualizar from "./pages/FichaAlunaVisualizar";
import PainelAlunas from "./pages/PainelAlunas";
import Relatorios from "./pages/Relatorios";
import BackupRestauracao from "./pages/BackupRestauracao";
import CatalogoCursos from "./pages/CatalogoCursos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/aluna/:id" element={<ProtectedRoute><Layout><AlunaDetalhes /></Layout></ProtectedRoute>} />
            <Route path="/aluna/:id/ficha" element={<ProtectedRoute><Layout><FichaAlunaVisualizar /></Layout></ProtectedRoute>} />
            <Route path="/painel-alunas" element={<ProtectedRoute><Layout><PainelAlunas /></Layout></ProtectedRoute>} />
            <Route path="/painel-alunas/:id" element={<ProtectedRoute><Layout><PainelAlunas /></Layout></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Layout><Relatorios /></Layout></ProtectedRoute>} />
            <Route path="/backup" element={<ProtectedRoute><Layout><BackupRestauracao /></Layout></ProtectedRoute>} />
            <Route path="/catalogo-cursos" element={<ProtectedRoute><Layout><CatalogoCursos /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
