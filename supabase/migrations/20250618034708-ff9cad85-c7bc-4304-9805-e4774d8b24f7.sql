
-- Criar tabela para despesas mensais
CREATE TABLE public.despesas_mensais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  mes_referencia TEXT NOT NULL, -- formato "MM/YYYY"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para despesas modelo (recorrência)
CREATE TABLE public.despesas_modelo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security) se necessário
ALTER TABLE public.despesas_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas_modelo ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir acesso público (ou ajuste conforme necessário)
CREATE POLICY "Allow all operations on despesas_mensais" ON public.despesas_mensais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on despesas_modelo" ON public.despesas_modelo FOR ALL USING (true) WITH CHECK (true);

-- Criar índices para melhor performance
CREATE INDEX idx_despesas_mensais_mes_referencia ON public.despesas_mensais(mes_referencia);
CREATE INDEX idx_despesas_mensais_data_vencimento ON public.despesas_mensais(data_vencimento);
CREATE INDEX idx_despesas_modelo_ativo ON public.despesas_modelo(ativo);
