
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DespesaMensal {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  mes_referencia: string;
  created_at: string;
  updated_at: string;
}

export interface DespesaModelo {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  dia_vencimento: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useDespesasMensais = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['despesas_mensais', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('despesas_mensais')
        .select('*');
      
      if (startDate && endDate) {
        query = query
          .gte('data_vencimento', startDate)
          .lte('data_vencimento', endDate);
      }
      
      const { data, error } = await query.order('data_vencimento', { ascending: false });
      
      if (error) throw error;
      return data as DespesaMensal[];
    }
  });
};

export const useDespesasModelo = () => {
  return useQuery({
    queryKey: ['despesas_modelo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas_modelo')
        .select('*')
        .order('descricao', { ascending: true });
      
      if (error) throw error;
      return data as DespesaModelo[];
    }
  });
};

export const useAddDespesaMensal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (despesa: Omit<DespesaMensal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('despesas_mensais')
        .insert([despesa])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas_mensais'] });
    }
  });
};

export const useUpdateDespesaMensal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DespesaMensal> & { id: string }) => {
      const { data, error } = await supabase
        .from('despesas_mensais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas_mensais'] });
    }
  });
};

export const useDeleteDespesaMensal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas_mensais')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas_mensais'] });
    }
  });
};

export const useAddDespesaModelo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (despesa: Omit<DespesaModelo, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('despesas_modelo')
        .insert([despesa])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas_modelo'] });
    }
  });
};

export const useUpdateDespesaModelo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DespesaModelo> & { id: string }) => {
      const { data, error } = await supabase
        .from('despesas_modelo')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas_modelo'] });
    }
  });
};

export const useDeleteDespesaModelo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas_modelo')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas_modelo'] });
    }
  });
};

export const useGerarNovoMes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mesReferencia: string) => {
      // Buscar despesas modelo ativas
      const { data: modelosDespesas, error: errorModelos } = await supabase
        .from('despesas_modelo')
        .select('*')
        .eq('ativo', true);
      
      if (errorModelos) throw errorModelos;
      
      // Gerar despesas mensais baseadas nos modelos
      const novasDespesas = modelosDespesas.map((modelo) => {
        const [mes, ano] = mesReferencia.split('/');
        const dataVencimento = new Date(parseInt(ano), parseInt(mes) - 1, modelo.dia_vencimento);
        
        return {
          descricao: modelo.descricao,
          categoria: modelo.categoria,
          valor: modelo.valor,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          mes_referencia: mesReferencia,
        };
      });
      
      if (novasDespesas.length > 0) {
        const { data, error } = await supabase
          .from('despesas_mensais')
          .insert(novasDespesas)
          .select();
        
        if (error) throw error;
        return data;
      }
      
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas_mensais'] });
    }
  });
};

export const useMarcarComoPago = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('despesas_mensais')
        .update({ data_pagamento: new Date().toISOString().split('T')[0] })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas_mensais'] });
    }
  });
};
