
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Receitas = lazy(() => import("@/pages/Receitas"));
const CustosFixos = lazy(() => import("@/pages/CustosFixos"));
const CustosVariaveis = lazy(() => import("@/pages/CustosVariaveis"));
const ResumoFinanceiro = lazy(() => import("@/pages/ResumoFinanceiro"));
const Categorias = lazy(() => import("@/pages/Categorias"));
const FolhaPagamento = lazy(() => import("@/pages/FolhaPagamento"));
const Index = lazy(() => import("@/pages/Index"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={
              <Suspense fallback={<div>Carregando...</div>}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="receitas" element={
              <Suspense fallback={<div>Carregando...</div>}>
                <Receitas />
              </Suspense>
            } />
            <Route path="custos-fixos" element={
              <Suspense fallback={<div>Carregando...</div>}>
                <CustosFixos />
              </Suspense>
            } />
            <Route path="custos-variaveis" element={
              <Suspense fallback={<div>Carregando...</div>}>
                <CustosVariaveis />
              </Suspense>
            } />
            <Route path="resumo-financeiro" element={
              <Suspense fallback={<div>Carregando...</div>}>
                <ResumoFinanceiro />
              </Suspense>
            } />
            <Route path="categorias" element={
              <Suspense fallback={<div>Carregando...</div>}>
                <Categorias />
              </Suspense>
            } />
            <Route path="folha-pagamento" element={
              <Suspense fallback={<div>Carregando...</div>}>
                <FolhaPagamento />
              </Suspense>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
