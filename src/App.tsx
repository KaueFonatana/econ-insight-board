
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Receitas from "./pages/Receitas";
import CustosFixos from "./pages/CustosFixos";
import CustosVariaveis from "./pages/CustosVariaveis";
import ResumoFinanceiro from "./pages/ResumoFinanceiro";
import Categorias from "./pages/Categorias";
import FolhaPagamento from "./pages/FolhaPagamento";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="receitas" element={<Receitas />} />
            <Route path="custos-fixos" element={<CustosFixos />} />
            <Route path="custos-variaveis" element={<CustosVariaveis />} />
            <Route path="resumo" element={<ResumoFinanceiro />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="folha-pagamento" element={<FolhaPagamento />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
