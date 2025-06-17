
import { useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateFilter from '@/components/ui/DateFilter';
import useFinancialData from '@/hooks/useFinancialData';

const CustosVariaveis = () => {
  const { data, addCustoVariavel } = useFinancialData();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    categoria: '',
    valor: '',
    data: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categoria && formData.valor && formData.data) {
      addCustoVariavel({
        categoria: formData.categoria,
        valor: parseFloat(formData.valor),
        data: formData.data,
      });
      setFormData({ categoria: '', valor: '', data: '' });
      setShowForm(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredCustos = data.custosVariaveis.filter(custo =>
    custo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustos = filteredCustos.reduce((sum, custo) => sum + custo.valor, 0);

  const handleDateChange = (startDate: string, endDate: string) => {
    console.log('Filtro de data aplicado:', { startDate, endDate });
  };

  // Agrupamento por categoria para o gráfico
  const custoPorCategoria = data.custosVariaveis.reduce((acc, custo) => {
    acc[custo.categoria] = (acc[custo.categoria] || 0) + custo.valor;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custos Variáveis</h1>
          <p className="text-gray-600 mt-1">Gerencie despesas variáveis por categoria</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="mt-4 lg:mt-0 bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Custo Variável
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DateFilter onDateChange={handleDateChange} />
        </div>
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
      </div>

      {/* Formulário de Novo Custo */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Custo Variável</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {data.categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.nome}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                required
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Salvar
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Resumo e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total de Custos Variáveis</h3>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalCustos)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Número de Itens</p>
              <p className="text-2xl font-bold text-orange-600">{filteredCustos.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custos por Categoria</h3>
          <div className="space-y-3">
            {Object.entries(custoPorCategoria).map(([categoria, valor]) => (
              <div key={categoria} className="flex items-center justify-between">
                <span className="text-gray-700">{categoria}</span>
                <span className="font-medium text-orange-600">{formatCurrency(valor)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lista de Custos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Custos Variáveis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustos.map((custo) => (
                <tr key={custo.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{custo.categoria}</td>
                  <td className="py-3 px-4 font-medium text-orange-600">
                    {formatCurrency(custo.valor)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(custo.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CustosVariaveis;
