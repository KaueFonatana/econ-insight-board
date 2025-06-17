
import { useState, useEffect } from 'react';

export interface Cliente {
  id: string;
  nome: string;
  valor: number;
  dataPagamento: string;
}

export interface CustoFixo {
  id: string;
  nome: string;
  valor: number;
  data: string;
}

export interface CustoVariavel {
  id: string;
  categoria: string;
  valor: number;
  data: string;
}

export interface Categoria {
  id: string;
  nome: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  salario: number;
  dataVencimento: string;
}

interface FinancialData {
  clientes: Cliente[];
  custosFixos: CustoFixo[];
  custosVariaveis: CustoVariavel[];
  categorias: Categoria[];
  funcionarios: Funcionario[];
}

const useFinancialData = () => {
  const [data, setData] = useState<FinancialData>({
    clientes: [
      { id: '1', nome: 'Cliente A', valor: 5000, dataPagamento: '2024-06-15' },
      { id: '2', nome: 'Cliente B', valor: 3500, dataPagamento: '2024-06-10' },
      { id: '3', nome: 'Cliente C', valor: 7200, dataPagamento: '2024-06-08' },
    ],
    custosFixos: [
      { id: '1', nome: 'Aluguel', valor: 2000, data: '2024-06-01' },
      { id: '2', nome: 'Salários', valor: 8000, data: '2024-06-01' },
      { id: '3', nome: 'Contabilidade', valor: 500, data: '2024-06-01' },
    ],
    custosVariaveis: [
      { id: '1', categoria: 'Marketing', valor: 800, data: '2024-06-05' },
      { id: '2', categoria: 'Impostos', valor: 1200, data: '2024-06-10' },
      { id: '3', categoria: 'Compras', valor: 600, data: '2024-06-12' },
    ],
    categorias: [
      { id: '1', nome: 'Marketing' },
      { id: '2', nome: 'Logística' },
      { id: '3', nome: 'Ferramentas' },
      { id: '4', nome: 'Impostos' },
      { id: '5', nome: 'Compras' },
    ],
    funcionarios: [
      { id: '1', nome: 'João Silva', salario: 3000, dataVencimento: '2024-06-30' },
      { id: '2', nome: 'Maria Santos', salario: 3500, dataVencimento: '2024-06-30' },
      { id: '3', nome: 'Pedro Costa', salario: 2800, dataVencimento: '2024-06-30' },
    ],
  });

  const addCliente = (cliente: Omit<Cliente, 'id'>) => {
    const newCliente = { ...cliente, id: Date.now().toString() };
    setData(prev => ({ ...prev, clientes: [...prev.clientes, newCliente] }));
  };

  const addCustoFixo = (custo: Omit<CustoFixo, 'id'>) => {
    const newCusto = { ...custo, id: Date.now().toString() };
    setData(prev => ({ ...prev, custosFixos: [...prev.custosFixos, newCusto] }));
  };

  const addCustoVariavel = (custo: Omit<CustoVariavel, 'id'>) => {
    const newCusto = { ...custo, id: Date.now().toString() };
    setData(prev => ({ ...prev, custosVariaveis: [...prev.custosVariaveis, newCusto] }));
  };

  const addCategoria = (categoria: Omit<Categoria, 'id'>) => {
    const newCategoria = { ...categoria, id: Date.now().toString() };
    setData(prev => ({ ...prev, categorias: [...prev.categorias, newCategoria] }));
  };

  const addFuncionario = (funcionario: Omit<Funcionario, 'id'>) => {
    const newFuncionario = { ...funcionario, id: Date.now().toString() };
    setData(prev => ({ ...prev, funcionarios: [...prev.funcionarios, newFuncionario] }));
  };

  const calculateFinancialSummary = () => {
    const receitaTotal = data.clientes.reduce((sum, cliente) => sum + cliente.valor, 0);
    const custosFixosTotal = data.custosFixos.reduce((sum, custo) => sum + custo.valor, 0);
    const custosVariaveisTotal = data.custosVariaveis.reduce((sum, custo) => sum + custo.valor, 0);
    const folhaPagamentoTotal = data.funcionarios.reduce((sum, func) => sum + func.salario, 0);
    
    const margemContribuicao = receitaTotal > 0 ? ((receitaTotal - custosVariaveisTotal) / receitaTotal) * 100 : 0;
    const breakEven = margemContribuicao > 0 ? (custosFixosTotal / (margemContribuicao / 100)) : 0;
    const lucroLiquido = receitaTotal - (custosFixosTotal + custosVariaveisTotal);

    return {
      receitaTotal,
      custosFixosTotal,
      custosVariaveisTotal,
      folhaPagamentoTotal,
      margemContribuicao,
      breakEven,
      lucroLiquido,
    };
  };

  return {
    data,
    addCliente,
    addCustoFixo,
    addCustoVariavel,
    addCategoria,
    addFuncionario,
    calculateFinancialSummary,
  };
};

export default useFinancialData;
