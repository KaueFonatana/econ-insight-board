import { useState, useMemo } from 'react';
import { Plus, Search, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateFilter from '@/components/ui/DateFilter';
import EditDeleteActions from '@/components/ui/EditDeleteActions';
import DespesaChart from './DespesaChart';
import { useDespesasMensais, useAddDespesaMensal, useUpdateDespesaMensal, useDeleteDespesaMensal, useMarkDespesaPaid, DespesaMensal } from '@/hooks/useDespesas';
import { useToast } from '@/hooks/use-toast';

const DespesasMensais = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const { data: despesas = [], isLoading } = useDespesasMensais(startDate, endDate);
  const addDespesaMutation = useAddDespesaMensal();
  const updateDespesaMutation = useUpdateDespesaMensal();
  const deleteDespesaMutation = useDeleteDespesaMensal();
  const markDespesaPaidMutation = useMarkDespesaPaid();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<DespesaMensal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: '',
    valor: '',
    data_vencimento: '',
    data_pagamento: '',
    mes_referencia: '',
  });

  const resetForm = () => {
    setFormData({ descricao: '', categoria: '', valor: '', data_vencimento: '', data_pagamento: '', mes_referencia: '' });
    setEditingDespesa(null);
    setShowForm(false);
  };

  const handleEdit = (despesa: DespesaMensal) => {
    setEditingDespesa(despesa);
    setFormData({
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      valor: despesa.valor.toString(),
      data_vencimento: despesa.data_vencimento,
      data_pagamento: despesa.data_pagamento || '',
      mes_referencia: despesa.mes_referencia,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deleteDespesaMutation.mutateAsync(id);
        toast({
          title: "Sucesso!",
          description: "Despesa excluída com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir despesa.",
          variant: "destructive",
        });
      }
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await markDespesaPaidMutation.mutateAsync(id);
      toast({
        title: "Sucesso!",
        description: "Despesa marcada como paga.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao marcar despesa como paga.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.descricao && formData.categoria && formData.valor && formData.data_vencimento && formData.mes_referencia) {
      try {
        const despesaData = {
          descricao: formData.descricao,
          categoria: formData.categoria,
          valor: parseFloat(formData.valor),
          data_vencimento: formData.data_vencimento,
          data_pagamento: formData.data_pagamento || null,
          mes_referencia: formData.mes_referencia,
        };

        if (editingDespesa) {
          await updateDespesaMutation.mutateAsync({
            id: editingDespesa.id,
            ...despesaData,
          });
          toast({
            title: "Sucesso!",
            description: "Despesa atualizada com sucesso.",
          });
        } else {
          await addDespesaMutation.mutateAsync(despesaData);
          toast({
            title: "Sucesso!",
            description: "Despesa adicionada com sucesso.",
          });
        }
        resetForm();
      } catch (error) {
        toast({
          title: "Erro",
          description: `Erro ao ${editingDespesa ? 'atualizar' : 'adicionar'} despesa.`,
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

  const filteredDespesas = useMemo(() => {
    return despesas.filter(despesa =>
      despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === '' || despesa.categoria === categoryFilter)
    );
  }, [despesas, searchTerm, categoryFilter]);

  const totalDespesas = filteredDespesas.reduce((sum, despesa) => sum + Number(despesa.valor), 0);

  const totalDespesasPagas = filteredDespesas.filter(despesa => despesa.data_pagamento).reduce((sum, despesa) => sum + Number(despesa.valor), 0);

  const totalDespesasPendentes = totalDespesas - totalDespesasPagas;

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    console.log('Filtro de data aplicado na tela de despesas:', { startDate: newStartDate, endDate: newEndDate });
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Data */}
      <DateFilter onDateChange={handleDateChange} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Despesas Mensais</h1>
          <p className="text-gray-600 mt-1">Gerencie suas despesas mensais</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 lg:mt-0 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar despesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
        <Card className="p-4">
          <Label htmlFor="categoria">Filtrar por Categoria</Label>
          <Select onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as Categorias</SelectItem>
              <SelectItem value="Alimentação">Alimentação</SelectItem>
              <SelectItem value="Transporte">Transporte</SelectItem>
              <SelectItem value="Moradia">Moradia</SelectItem>
              {/* Adicione mais categorias conforme necessário */}
            </SelectContent>
          </Select>
        </Card>
        <Card className="p-4 flex items-center">
          <div className="flex flex-col items-start">
            <h3 className="text-lg font-semibold text-gray-900">Total de Despesas</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDespesas)}</p>
          </div>
        </Card>
      </div>

      {/* Formulário de Nova/Editar Despesa */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Ex: Aluguel, Supermercado..."
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select onValueChange={(value) => setFormData({...formData, categoria: value})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alimentação">Alimentação</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
                  <SelectItem value="Moradia">Moradia</SelectItem>
                  {/* Adicione mais categorias conforme necessário */}
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
              <Label htmlFor="data_vencimento">Data de Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="data_pagamento">Data de Pagamento (Opcional)</Label>
              <Input
                id="data_pagamento"
                type="date"
                value={formData.data_pagamento}
                onChange={(e) => setFormData({...formData, data_pagamento: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="mes_referencia">Mês de Referência</Label>
              <Input
                id="mes_referencia"
                type="month"
                value={formData.mes_referencia}
                onChange={(e) => setFormData({...formData, mes_referencia: e.target.value})}
                required
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={addDespesaMutation.isPending || updateDespesaMutation.isPending}
              >
                {addDespesaMutation.isPending || updateDespesaMutation.isPending ? 'Salvando...' :
                 editingDespesa ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Despesas</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDespesas)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas Pagas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDespesasPagas)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas Pendentes</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesasPendentes)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <DespesaChart despesas={filteredDespesas} />
        </Card>
      </div>

      {/* Lista de Despesas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Despesas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Pagamento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Mês Referência</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDespesas.map((despesa) => (
                <tr key={despesa.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{despesa.descricao}</td>
                  <td className="py-3 px-4 text-gray-600">{despesa.categoria}</td>
                  <td className="py-3 px-4 font-medium text-blue-600">
                    {formatCurrency(Number(despesa.valor))}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(despesa.data_vencimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {despesa.data_pagamento ? new Date(despesa.data_pagamento).toLocaleDateString('pt-BR') :
                     <Badge variant="outline">Pendente</Badge>}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{despesa.mes_referencia}</td>
                  <td className="py-3 px-4">
                    <EditDeleteActions
                      onEdit={() => handleEdit(despesa)}
                      onDelete={() => handleDelete(despesa.id)}
                      onMarkAsPaid={() => handleMarkAsPaid(despesa.id)}
                      isLoading={deleteDespesaMutation.isPending || markDespesaPaidMutation.isPending}
                      isPaid={!!despesa.data_pagamento}
                    />
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

export default DespesasMensais;
