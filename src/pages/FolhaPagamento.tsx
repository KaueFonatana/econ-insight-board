
import { useState } from 'react';
import { Plus, Search, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import DateFilter from '@/components/ui/DateFilter';
import EditDeleteActions from '@/components/ui/EditDeleteActions';
import { useFuncionarios, useAddFuncionario, useUpdateFuncionario, useDeleteFuncionario, Funcionario } from '@/hooks/useSupabaseFinancialData';
import { useToast } from '@/hooks/use-toast';

const FolhaPagamento = () => {
  const { data: funcionarios = [], isLoading } = useFuncionarios();
  const addFuncionarioMutation = useAddFuncionario();
  const updateFuncionarioMutation = useUpdateFuncionario();
  const deleteFuncionarioMutation = useDeleteFuncionario();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    salario: '',
    data_vencimento: '',
  });

  const resetForm = () => {
    setFormData({ nome: '', salario: '', data_vencimento: '' });
    setEditingFuncionario(null);
    setShowForm(false);
  };

  const handleEdit = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario);
    setFormData({
      nome: funcionario.nome,
      salario: funcionario.salario.toString(),
      data_vencimento: funcionario.data_vencimento,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await deleteFuncionarioMutation.mutateAsync(id);
        toast({
          title: "Sucesso!",
          description: "Funcionário excluído com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir funcionário.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome && formData.salario && formData.data_vencimento) {
      try {
        const funcionarioData = {
          nome: formData.nome,
          salario: parseFloat(formData.salario),
          data_vencimento: formData.data_vencimento,
        };

        if (editingFuncionario) {
          await updateFuncionarioMutation.mutateAsync({
            id: editingFuncionario.id,
            ...funcionarioData,
          });
          toast({
            title: "Sucesso!",
            description: "Funcionário atualizado com sucesso.",
          });
        } else {
          await addFuncionarioMutation.mutateAsync(funcionarioData);
          toast({
            title: "Sucesso!",
            description: "Funcionário adicionado com sucesso.",
          });
        }
        resetForm();
      } catch (error) {
        toast({
          title: "Erro",
          description: `Erro ao ${editingFuncionario ? 'atualizar' : 'adicionar'} funcionário.`,
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

  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFolha = filteredFuncionarios.reduce((sum, funcionario) => sum + Number(funcionario.salario), 0);
  const mediaSalarial = filteredFuncionarios.length > 0 ? totalFolha / filteredFuncionarios.length : 0;

  const handleDateChange = (startDate: string, endDate: string) => {
    console.log('Filtro de data aplicado:', { startDate, endDate });
  };

  // Verificar vencimentos próximos
  const hoje = new Date();
  const proximoVencimento = filteredFuncionarios.filter(funcionario => {
    const vencimento = new Date(funcionario.data_vencimento);
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
    return diasRestantes <= 7 && diasRestantes >= 0;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Folha de Pagamento</h1>
          <p className="text-gray-600 mt-1">Gerencie salários e vencimentos dos funcionários</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="mt-4 lg:mt-0 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Funcionário
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
              placeholder="Buscar funcionário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
      </div>

      {/* Alerta de Vencimentos */}
      {proximoVencimento.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="font-medium text-orange-800">Vencimentos Próximos</h3>
              <p className="text-sm text-orange-700">
                {proximoVencimento.length} pagamento(s) vencem nos próximos 7 dias
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Formulário de Novo/Editar Funcionário */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Funcionário</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: João Silva"
                required
              />
            </div>
            <div>
              <Label htmlFor="salario">Salário</Label>
              <Input
                id="salario"
                type="number"
                step="0.01"
                value={formData.salario}
                onChange={(e) => setFormData({...formData, salario: e.target.value})}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                required
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={addFuncionarioMutation.isPending || updateFuncionarioMutation.isPending}
              >
                {addFuncionarioMutation.isPending || updateFuncionarioMutation.isPending ? 'Salvando...' : 
                 editingFuncionario ? 'Atualizar' : 'Salvar'}
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

      {/* Resumo da Folha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total da Folha</p>
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(totalFolha)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Número de Funcionários</p>
              <p className="text-2xl font-bold text-green-600">{filteredFuncionarios.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Média Salarial</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(mediaSalarial)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Funcionários */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Funcionários</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Salário</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Data de Vencimento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredFuncionarios.map((funcionario) => {
                const vencimento = new Date(funcionario.data_vencimento);
                const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
                const isVencimentoProximo = diasRestantes <= 7 && diasRestantes >= 0;
                
                return (
                  <tr key={funcionario.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{funcionario.nome}</td>
                    <td className="py-3 px-4 font-medium text-indigo-600">
                      {formatCurrency(funcionario.salario)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(funcionario.data_vencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isVencimentoProximo 
                          ? 'bg-orange-100 text-orange-800' 
                          : diasRestantes < 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isVencimentoProximo 
                          ? `${diasRestantes} dias` 
                          : diasRestantes < 0
                          ? 'Vencido'
                          : 'Em dia'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <EditDeleteActions
                        onEdit={() => handleEdit(funcionario)}
                        onDelete={() => handleDelete(funcionario.id)}
                        isLoading={deleteFuncionarioMutation.isPending}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Análise de Custos com Pessoal */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Custos com Pessoal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Distribuição Salarial</h4>
            <div className="space-y-2">
              {filteredFuncionarios
                .sort((a, b) => b.salario - a.salario)
                .map((funcionario) => (
                  <div key={funcionario.id} className="flex justify-between items-center">
                    <span className="text-gray-600">{funcionario.nome}</span>
                    <div className="text-right">
                      <span className="font-medium text-indigo-600">
                        {formatCurrency(funcionario.salario)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {((funcionario.salario / totalFolha) * 100).toFixed(1)}% do total
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Próximos Vencimentos</h4>
            <div className="space-y-2">
              {filteredFuncionarios
                .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())
                .slice(0, 5)
                .map((funcionario) => {
                  const diasRestantes = Math.ceil(
                    (new Date(funcionario.data_vencimento).getTime() - hoje.getTime()) / (1000 * 3600 * 24)
                  );
                  return (
                    <div key={funcionario.id} className="flex justify-between items-center">
                      <span className="text-gray-600">{funcionario.nome}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          {new Date(funcionario.data_vencimento).toLocaleDateString('pt-BR')}
                        </span>
                        <div className={`text-xs ${
                          diasRestantes <= 7 ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          {diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencido'}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FolhaPagamento;
