import { DollarSign, TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, ResponsiveContainer } from 'recharts';
import KPICard from '@/components/ui/KPICard';
import DateFilter from '@/components/ui/DateFilter';
import { useFinancialSummary } from '@/hooks/useSupabaseFinancialData';
import { useState } from 'react';

const Dashboard = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const summary = useFinancialSummary(startDate, endDate);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    console.log('Filtro de data aplicado:', { startDate: newStartDate, endDate: newEndDate });
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Dados para distribuição de custos apenas com dados reais
  const pieData = [
    { name: 'Custos Fixos', value: summary.custosFixosTotal, color: '#ef4444' },
    { name: 'Custos Variáveis', value: summary.custosVariaveisTotal, color: '#f97316' },
    { name: 'Lucro', value: summary.lucroLiquido > 0 ? summary.lucroLiquido : 0, color: '#22c55e' },
  ].filter(item => item.value > 0); // Remove itens com valor zero

  // Dados para comparação atual apenas com dados reais
  const currentData = [
    { name: 'Receitas', value: summary.receitaTotal, fill: '#22c55e' },
    { name: 'Custos Fixos', value: summary.custosFixosTotal, fill: '#ef4444' },
    { name: 'Custos Variáveis', value: summary.custosVariaveisTotal, fill: '#f97316' },
    { name: 'Folha de Pagamento', value: summary.folhaPagamentoTotal, fill: '#8b5cf6' },
  ].filter(item => item.value > 0); // Remove itens com valor zero

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Financeiro</h1>
          <p className="text-gray-600 mt-1">Visão geral do desempenho financeiro</p>
        </div>
      </div>

      {/* Filtros de Data */}
      <DateFilter onDateChange={handleDateChange} />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Receita Total"
          value={formatCurrency(summary.receitaTotal)}
          icon={DollarSign}
          changeType="positive"
        />
        <KPICard
          title="Custos Totais"
          value={formatCurrency(summary.custosFixosTotal + summary.custosVariaveisTotal)}
          icon={TrendingDown}
          changeType="negative"
        />
        <KPICard
          title="Lucro Líquido"
          value={formatCurrency(summary.lucroLiquido)}
          icon={TrendingUp}
          changeType={summary.lucroLiquido > 0 ? "positive" : "negative"}
        />
        <KPICard
          title="Margem de Contribuição"
          value={`${summary.margemContribuicao.toFixed(1)}%`}
          icon={BarChart3}
        />
        <KPICard
          title="Break Even"
          value={formatCurrency(summary.breakEven)}
          icon={Target}
        />
        <KPICard
          title="Folha de Pagamento"
          value={formatCurrency(summary.folhaPagamentoTotal)}
          icon={TrendingDown}
        />
      </div>

      {/* Gráficos apenas se houver dados */}
      {currentData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Dados Atuais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparativo Financeiro Atual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Distribuição de Custos */}
          {pieData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Custos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <RechartsPieChart data={pieData} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mensagem quando não há dados */}
      {currentData.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum dado disponível</h3>
          <p className="text-gray-600">Adicione receitas, custos ou funcionários para visualizar os gráficos.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
