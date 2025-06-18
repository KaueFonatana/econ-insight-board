
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { DespesaMensal } from '@/hooks/useDespesas';

interface DespesaChartProps {
  despesas: DespesaMensal[];
}

const DespesaChart = ({ despesas }: DespesaChartProps) => {
  const chartData = useMemo(() => {
    const categorias = new Map<string, { previsto: number; pago: number }>();
    
    despesas.forEach(despesa => {
      const categoria = despesa.categoria;
      const valor = Number(despesa.valor);
      
      if (!categorias.has(categoria)) {
        categorias.set(categoria, { previsto: 0, pago: 0 });
      }
      
      const categoriaDados = categorias.get(categoria)!;
      categoriaDados.previsto += valor;
      
      if (despesa.data_pagamento) {
        categoriaDados.pago += valor;
      }
    });
    
    return Array.from(categorias.entries()).map(([categoria, dados]) => ({
      categoria,
      Previsto: dados.previsto,
      Pago: dados.pago,
      Pendente: dados.previsto - dados.pago,
    }));
  }, [despesas]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Despesas por Categoria - Previsto vs Pago
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="categoria" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="Previsto" fill="#3b82f6" name="Previsto" />
            <Bar dataKey="Pago" fill="#10b981" name="Pago" />
            <Bar dataKey="Pendente" fill="#f59e0b" name="Pendente" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DespesaChart;
