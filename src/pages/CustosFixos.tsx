
import { useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import DateFilter from '@/components/ui/DateFilter';
import { useCustosFixos, useAddCustoFixo } from '@/hooks/useSupabaseFinancialData';
import { useToast } from '@/hooks/use-toast';

const CustosFixos = () => {
  const { data: custosFixos = [], isLoading } = useCustosFixos();
  const addCustoFixoMutation = useAddCustoFixo();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    data: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome && formData.valor && formData.data) {
      try {
        await addCustoFixoMutation.mutateAsync({
          nome: formData.nome,
          valor: parseFloat(formData.valor),
          data: formData.data,
        });
        setFormData({ nome: '', valor: '', data: '' });
        setShowForm(false);
        toast({
          title: "Sucesso!",
          description: "Custo fixo adicionado com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao adicionar custo fixo.",
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

  const filteredCustos = custosFixos.filter(custo =>
    custo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustos = filteredCustos.reduce((sum, custo) => sum + Number(custo.valor), 0);

  const handleDateChange = (startDate: string, endDate: string) => {
    console.log('Filtro de data aplicado:', { startDate, endDate });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custos Fixos</h1>
          <p className="text-gray-600 mt-1">Gerencie despesas fixas recorrentes</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="mt-4 lg:mt-0 bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Custo Fixo
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
              placeholder="Buscar custo..."
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Custo Fixo</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Custo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Aluguel, Salários..."
                required
              />
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
                className="bg-red-600 hover:bg-red-700"
                disabled={addCustoFixoMutation.isPending}
              >
                {addCustoFixoMutation.isPending ? 'Salvando...' : 'Salvar'}
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

      {/* Resumo */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total de Custos Fixos</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCustos)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Número de Itens</p>
            <p className="text-2xl font-bold text-red-600">{filteredCustos.length}</p>
          </div>
        </div>
      </Card>

      {/* Lista de Custos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Custos Fixos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustos.map((custo) => (
                <tr key={custo.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{custo.nome}</td>
                  <td className="py-3 px-4 font-medium text-red-600">
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

export default CustosFixos;
