
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Cliente {
  id: string;
  nome: string;
  valor: number;
  data_pagamento: string;
}

export interface CustoFixo {
  id: string;
  nome: string;
  valor: number;
  data: string;
}

export interface CustoVariavel {
  id: string;
  categoria_id: string;
  categoria?: { nome: string };
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
  data_vencimento: string;
}

export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('data_pagamento', { ascending: false });
      
      if (error) throw error;
      return data as Cliente[];
    }
  });
};

export const useCustosFixos = () => {
  return useQuery({
    queryKey: ['custos_fixos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custos_fixos')
        .select('*')
        .order('data', { ascending: false });
      
      if (error) throw error;
      return data as CustoFixo[];
    }
  });
};

export const useCustosVariaveis = () => {
  return useQuery({
    queryKey: ['custos_variaveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custos_variaveis')
        .select(`
          *,
          categoria:categorias(nome)
        `)
        .order('data', { ascending: false });
      
      if (error) throw error;
      return data as CustoVariavel[];
    }
  });
};

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Categoria[];
    }
  });
};

export const useFuncionarios = () => {
  return useQuery({
    queryKey: ['funcionarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .order('data_vencimento');
      
      if (error) throw error;
      return data as Funcionario[];
    }
  });
};

export const useAddCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cliente: Omit<Cliente, 'id'>) => {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    }
  });
};

export const useAddCustoFixo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (custo: Omit<CustoFixo, 'id'>) => {
      const { data, error } = await supabase
        .from('custos_fixos')
        .insert([custo])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custos_fixos'] });
    }
  });
};

export const useAddCustoVariavel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (custo: Omit<CustoVariavel, 'id' | 'categoria'>) => {
      const { data, error } = await supabase
        .from('custos_variaveis')
        .insert([custo])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custos_variaveis'] });
    }
  });
};

export const useAddCategoria = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoria: Omit<Categoria, 'id'>) => {
      const { data, error } = await supabase
        .from('categorias')
        .insert([categoria])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    }
  });
};

export const useAddFuncionario = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (funcionario: Omit<Funcionario, 'id'>) => {
      const { data, error } = await supabase
        .from('funcionarios')
        .insert([funcionario])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    }
  });
};

export const useFinancialSummary = () => {
  const { data: clientes = [] } = useClientes();
  const { data: custosFixos = [] } = useCustosFixos();
  const { data: custosVariaveis = [] } = useCustosVariaveis();
  const { data: funcionarios = [] } = useFuncionarios();

  const calculateFinancialSummary = () => {
    const receitaTotal = clientes.reduce((sum, cliente) => sum + Number(cliente.valor), 0);
    const custosFixosTotal = custosFixos.reduce((sum, custo) => sum + Number(custo.valor), 0);
    const custosVariaveisTotal = custosVariaveis.reduce((sum, custo) => sum + Number(custo.valor), 0);
    const folhaPagamentoTotal = funcionarios.reduce((sum, func) => sum + Number(func.salario), 0);
    
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

  return calculateFinancialSummary();
};
