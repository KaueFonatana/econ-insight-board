
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Target, Calculator, Percent } from 'lucide-react';
import KPICard from '@/components/ui/KPICard';
import { Card } from '@/components/ui/card';
import DateFilter from '@/components/ui/DateFilter';
import useFinancialData from '@/hooks/useFinancialData';

const ResumoFinanceiro = () => {
  const { calculateFinancialSummary } = useFinancialData();
  const summary = calculateFinancialSummary();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleDateChange = (startDate: string, endDate: string) => {
    console.log('Filtro de data aplicado:', { startDate, endDate });
  };

  // Dados para o gráfico comparativo
  const chartData = [
    {
      name: 'Receitas',
      valor: summary.receitaTotal,
      fill: '#22c55e'
    },
    {
      name: 'Custos Fixos',
      valor: summary.custosFixosTotal,
      fill: '#ef4444'
    },
    {
      name: 'Custos Variáveis',
      valor: summary.custosVariaveisTotal,
      fill: '#f97316'
    },
    {
      name: 'Folha de Pagamento',
      valor: summary.folhaPagamentoTotal,
      fill: '#8b5cf6'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resumo Financeiro</h1>
          <p className="text-gray-600 mt-1">Análise completa dos indicadores financeiros</p>
        </div>
      </div>

      {/* Filtros */}
      <DateFilter onDateChange={handleDateChange} />

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Receita Total"
          value={formatCurrency(summary.receitaTotal)}
          icon={DollarSign}
          changeType="positive"
          className="col-span-1 md:col-span-2 lg:col-span-1"
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
      </div>

      {/* Indicadores Calculados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Percent className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Margem de Contribuição</p>
              <p className="text-2xl font-bold text-blue-600">{formatPercentage(summary.margemContribuicao)}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Fórmula: (Receita - Custos Variáveis) ÷ Receita × 100
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Break Even (Ponto de Equilíbrio)</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.breakEven)}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Fórmula: Custos Fixos ÷ Margem de Contribuição
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calculator className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">ROI (Retorno sobre Investimento)</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.receitaTotal > 0 ? formatPercentage((summary.lucroLiquido / summary.receitaTotal) * 100) : '0%'}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Fórmula: (Lucro Líquido ÷ Receita Total) × 100
            </p>
          </div>
        </Card>
      </div>

      {/* Gráfico Comparativo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparativo Financeiro</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="valor" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Análise Detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Custos</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Custos Fixos</span>
              <span className="font-medium text-red-600">{formatCurrency(summary.custosFixosTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Custos Variáveis</span>
              <span className="font-medium text-orange-600">{formatCurrency(summary.custosVariaveisTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Folha de Pagamento</span>
              <span className="font-medium text-purple-600">{formatCurrency(summary.folhaPagamentoTotal)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Total de Custos</span>
                <span className="text-red-600">
                  {formatCurrency(summary.custosFixosTotal + summary.custosVariaveisTotal)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Margem Bruta</span>
              <span className="font-medium text-blue-600">
                {formatPercentage(summary.margemContribuicao)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Margem Líquida</span>
              <span className="font-medium text-green-600">
                {summary.receitaTotal > 0 ? formatPercentage((summary.lucroLiquido / summary.receitaTotal) * 100) : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Participação dos Custos Fixos</span>
              <span className="font-medium text-red-600">
                {summary.receitaTotal > 0 ? formatPercentage((summary.custosFixosTotal / summary.receitaTotal) * 100) : '0%'}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900">Status Financeiro</span>
                <span className={summary.lucroLiquido > 0 ? "text-green-600" : "text-red-600"}>
                  {summary.lucroLiquido > 0 ? "LUCRO" : "PREJUÍZO"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResumoFinanceiro;
