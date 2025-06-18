
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import EditDeleteActions from '@/components/ui/EditDeleteActions';
import { useDespesasModelo, useAddDespesaModelo, useUpdateDespesaModelo, useDeleteDespesaModelo, DespesaModelo } from '@/hooks/useDespesas';
import { useToast } from '@/hooks/use-toast';

const DespesasModelo = () => {
  const { data: despesasModelo = [], isLoading } = useDespesasModelo();
  const addDespesaModeloMutation = useAddDespesaModelo();
  const updateDespesaModeloMutation = useUpdateDespesaModelo();
  const deleteDespesaModeloMutation = useDeleteDespesaModelo();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<DespesaModelo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: '',
    valor: '',
    dia_vencimento: '',
    ativo: true,
  });

  const despesasFiltradas = despesasModelo.filter(despesa =>
    despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    despesa.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ descricao: '', categoria: '', valor: '', dia_vencimento: '', ativo: true });
    setEditingDespesa(null);
    setShowForm(false);
  };

  const handleEdit = (despesa: DespesaModelo) => {
    setEditingDespesa(despesa);
    setFormData({
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      valor: despesa.valor.toString(),
      dia_vencimento: despesa.dia_vencimento.toString(),
      ativo: despesa.ativo,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa modelo?')) {
      try {
        await deleteDespesaModeloMutation.mutateAsync(id);
        toast({
          title: "Sucesso!",
          description: "Despesa modelo excluída com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir despesa modelo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.descricao && formData.categoria && formData.valor && formData.dia_vencimento) {
      try {
        const despesaData = {
          descricao: formData.descricao,
          categoria: formData.categoria,
          valor: parseFloat(formData.valor),
          dia_vencimento: parseInt(formData.dia_vencimento),
          ativo: formData.ativo,
        };

        if (editingDespesa) {
          await updateDespesaModeloMutation.mutateAsync({
            id: editingDespesa.id,
            ...despesaData,
          });
          toast({
            title: "Sucesso!",
            description: "Despesa modelo atualizada com sucesso.",
          });
        } else {
          await addDespesaModeloMutation.mutateAsync(despesaData);
          toast({
            title: "Sucesso!",
            description: "Despesa modelo adicionada com sucesso.",
          });
        }
        resetForm();
      } catch (error) {
        toast({
          title: "Erro",
          description: `Erro ao ${editingDespesa ? 'atualizar' : 'adicionar'} despesa modelo.`,
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

  const totalDespesasAtivas = despesasFiltradas
    .filter(d => d.ativo)
    .reduce((sum, d) => sum + Number(d.valor), 0);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Despesas Modelo</h2>
          <p className="text-gray-600 mt-1">Modelos de despesas recorrentes para geração automática</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="mt-4 lg:mt-0 bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa Modelo
        </Button>
      </div>

      {/* Filtros e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar despesa modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>
        </div>
        <Card className="p-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Mensal Estimado</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDespesasAtivas)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {despesasFiltradas.filter(d => d.ativo).length} despesas ativas
            </p>
          </div>
        </Card>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDespesa ? 'Editar Despesa Modelo' : 'Nova Despesa Modelo'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Ex: Aluguel..."
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                placeholder="Ex: Fixos..."
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
              <Label htmlFor="dia_vencimento">Dia Vencimento</Label>
              <Input
                id="dia_vencimento"
                type="number"
                min="1"
                max="31"
                value={formData.dia_vencimento}
                onChange={(e) => setFormData({...formData, dia_vencimento: e.target.value})}
                placeholder="Ex: 15"
                required
              />
            </div>
            <div className="md:col-span-4 flex items-center space-x-2">
              <Checkbox
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({...formData, ativo: checked as boolean})}
              />
              <Label htmlFor="ativo">Ativo (será incluído na geração de novos meses)</Label>
            </div>
            <div className="md:col-span-4 flex gap-2">
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700"
                disabled={addDespesaModeloMutation.isPending || updateDespesaModeloMutation.isPending}
              >
                {addDespesaModeloMutation.isPending || updateDespesaModeloMutation.isPending ? 'Salvando...' : 
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

      {/* Lista de Despesas Modelo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Despesas Modelo</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Dia Vencimento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesasFiltradas.map((despesa) => (
                <tr key={despesa.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{despesa.descricao}</td>
                  <td className="py-3 px-4 text-gray-600">{despesa.categoria}</td>
                  <td className="py-3 px-4 font-medium text-red-600">
                    {formatCurrency(Number(despesa.valor))}
                  </td>
                  <td className="py-3 px-4 text-gray-600">Dia {despesa.dia_vencimento}</td>
                  <td className="py-3 px-4">
                    {despesa.ativo ? (
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <EditDeleteActions
                      onEdit={() => handleEdit(despesa)}
                      onDelete={() => handleDelete(despesa.id)}
                      isLoading={deleteDespesaModeloMutation.isPending}
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

export default DespesasModelo;
