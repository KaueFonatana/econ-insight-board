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

export const useClientes = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['clientes', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('clientes')
        .select('*');
      
      if (startDate && endDate) {
        query = query
          .gte('data_pagamento', startDate)
          .lte('data_pagamento', endDate);
      }
      
      const { data, error } = await query.order('data_pagamento', { ascending: false });
      
      if (error) throw error;
      return data as Cliente[];
    }
  });
};

export const useCustosFixos = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['custos_fixos', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('custos_fixos')
        .select('*');
      
      if (startDate && endDate) {
        query = query
          .gte('data', startDate)
          .lte('data', endDate);
      }
      
      const { data, error } = await query.order('data', { ascending: false });
      
      if (error) throw error;
      return data as CustoFixo[];
    }
  });
};

export const useCustosVariaveis = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['custos_variaveis', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('custos_variaveis')
        .select(`
          *,
          categoria:categorias(nome)
        `);
      
      if (startDate && endDate) {
        query = query
          .gte('data', startDate)
          .lte('data', endDate);
      }
      
      const { data, error } = await query.order('data', { ascending: false });
      
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

export const useFuncionarios = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['funcionarios', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('funcionarios')
        .select('*');
      
      if (startDate && endDate) {
        query = query
          .gte('data_vencimento', startDate)
          .lte('data_vencimento', endDate);
      }
      
      const { data, error } = await query.order('data_vencimento');
      
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

export const useUpdateCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cliente> & { id: string }) => {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
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

export const useUpdateCustoFixo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustoFixo> & { id: string }) => {
      const { data, error } = await supabase
        .from('custos_fixos')
        .update(updates)
        .eq('id', id)
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

export const useUpdateCustoVariavel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Omit<CustoVariavel, 'categoria'>> & { id: string }) => {
      const { data, error } = await supabase
        .from('custos_variaveis')
        .update(updates)
        .eq('id', id)
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

export const useUpdateCategoria = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Categoria> & { id: string }) => {
      const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
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

export const useUpdateFuncionario = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Funcionario> & { id: string }) => {
      const { data, error } = await supabase
        .from('funcionarios')
        .update(updates)
        .eq('id', id)
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

export const useDeleteCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    }
  });
};

export const useDeleteCustoFixo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custos_fixos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custos_fixos'] });
    }
  });
};

export const useDeleteCustoVariavel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custos_variaveis')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custos_variaveis'] });
    }
  });
};

export const useDeleteCategoria = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    }
  });
};

export const useDeleteFuncionario = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    }
  });
};

export const useFinancialSummary = (startDate?: string, endDate?: string) => {
  const { data: clientes = [] } = useClientes(startDate, endDate);
  const { data: custosFixos = [] } = useCustosFixos(startDate, endDate);
  const { data: custosVariaveis = [] } = useCustosVariaveis(startDate, endDate);
  const { data: funcionarios = [] } = useFuncionarios(startDate, endDate);

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
