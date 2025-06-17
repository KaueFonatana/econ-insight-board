
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import KPICard from '@/components/ui/KPICard';
import DateFilter from '@/components/ui/DateFilter';
import useFinancialData from '@/hooks/useFinancialData';

const Dashboard = () => {
  const { calculateFinancialSummary } = useFinancialData();
  const summary = calculateFinancialSummary();

  // Dados para gráficos
  const monthlyData = [
    { mes: 'Jan', receita: 15000, custos: 8000 },
    { mes: 'Fev', receita: 18000, custos: 9000 },
    { mes: 'Mar', receita: 16000, custos: 8500 },
    { mes: 'Abr', receita: 20000, custos: 9500 },
    { mes: 'Mai', receita: 22000, custos: 10000 },
    { mes: 'Jun', receita: summary.receitaTotal, custos: summary.custosFixosTotal + summary.custosVariaveisTotal },
  ];

  const pieData = [
    { name: 'Custos Fixos', value: summary.custosFixosTotal, color: '#ef4444' },
    { name: 'Custos Variáveis', value: summary.custosVariaveisTotal, color: '#f97316' },
    { name: 'Lucro', value: summary.lucroLiquido > 0 ? summary.lucroLiquido : 0, color: '#22c55e' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDateChange = (startDate: string, endDate: string) => {
    console.log('Filtro de data aplicado:', { startDate, endDate });
  };

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
          change="+12.5%"
          changeType="positive"
        />
        <KPICard
          title="Custos Totais"
          value={formatCurrency(summary.custosFixosTotal + summary.custosVariaveisTotal)}
          icon={TrendingDown}
          change="+3.2%"
          changeType="negative"
        />
        <KPICard
          title="Lucro Líquido"
          value={formatCurrency(summary.lucroLiquido)}
          icon={TrendingUp}
          change="+18.7%"
          changeType={summary.lucroLiquido > 0 ? "positive" : "negative"}
        />
        <KPICard
          title="Margem de Contribuição"
          value={`${summary.margemContribuicao.toFixed(1)}%`}
          icon={BarChart3}
          change="+2.1%"
          changeType="positive"
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Receita vs Custos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita vs Custos Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="receita" fill="#2563eb" name="Receita" />
              <Bar dataKey="custos" fill="#dc2626" name="Custos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Distribuição de Custos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Custos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <RechartsPieChart dataKey="value">
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
      </div>

      {/* Gráfico de Linha - Evolução */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Lucro</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line 
              type="monotone" 
              dataKey="receita" 
              stroke="#2563eb" 
              strokeWidth={3}
              name="Receita"
            />
            <Line 
              type="monotone" 
              dataKey="custos" 
              stroke="#dc2626" 
              strokeWidth={3}
              name="Custos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
