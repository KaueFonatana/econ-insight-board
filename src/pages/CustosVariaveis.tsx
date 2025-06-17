
import { useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateFilter from '@/components/ui/DateFilter';
import { useCustosVariaveis, useAddCustoVariavel, useCategorias } from '@/hooks/useSupabaseFinancialData';
import { useToast } from '@/hooks/use-toast';

const CustosVariaveis = () => {
  const { data: custosVariaveis = [], isLoading } = useCustosVariaveis();
  const { data: categorias = [] } = useCategorias();
  const addCustoVariavelMutation = useAddCustoVariavel();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    categoria_id: '',
    valor: '',
    data: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categoria_id && formData.valor && formData.data) {
      try {
        await addCustoVariavelMutation.mutateAsync({
          categoria_id: formData.categoria_id,
          valor: parseFloat(formData.valor),
          data: formData.data,
        });
        setFormData({ categoria_id: '', valor: '', data: '' });
        setShowForm(false);
        toast({
          title: "Sucesso!",
          description: "Custo variável adicionado com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao adicionar custo variável.",
          variant: "destructive",
        });
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredCustos = custosVariaveis.filter(custo =>
    custo.categoria?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustos = filteredCustos.reduce((sum, custo) => sum + Number(custo.valor), 0);

  const handleDateChange = (startDate: string, endDate: string) => {
    console.log('Filtro de data aplicado:', { startDate, endDate });
  };

  // Agrupamento por categoria para o gráfico
  const custoPorCategoria = custosVariaveis.reduce((acc, custo) => {
    const categoria = custo.categoria?.nome || 'Sem categoria';
    acc[categoria] = (acc[categoria] || 0) + Number(custo.valor);
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

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
              <Select value={formData.categoria_id} onValueChange={(value) => setFormData({...formData, categoria_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
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
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={addCustoVariavelMutation.isPending}
              >
                {addCustoVariavelMutation.isPending ? 'Salvando...' : 'Salvar'}
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
                  <td className="py-3 px-4 text-gray-900">{custo.categoria?.nome || 'Sem categoria'}</td>
                  <td className="py-3 px-4 font-medium text-orange-600">
                    {formatCurrency(Number(custo.valor))}
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
