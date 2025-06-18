
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import DateFilter from '@/components/ui/DateFilter';
import EditDeleteActions from '@/components/ui/EditDeleteActions';
import { useClientes, useAddCliente, useUpdateCliente, useDeleteCliente, Cliente } from '@/hooks/useSupabaseFinancialData';
import { useToast } from '@/hooks/use-toast';

const Receitas = () => {
  const { data: clientes = [], isLoading } = useClientes();
  const addClienteMutation = useAddCliente();
  const updateClienteMutation = useUpdateCliente();
  const deleteClienteMutation = useDeleteCliente();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    data_pagamento: '',
  });

  const resetForm = () => {
    setFormData({ nome: '', valor: '', data_pagamento: '' });
    setEditingCliente(null);
    setShowForm(false);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      valor: cliente.valor.toString(),
      data_pagamento: cliente.data_pagamento,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await deleteClienteMutation.mutateAsync(id);
        toast({
          title: "Sucesso!",
          description: "Receita excluída com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir receita.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome && formData.valor && formData.data_pagamento) {
      try {
        const clienteData = {
          nome: formData.nome,
          valor: parseFloat(formData.valor),
          data_pagamento: formData.data_pagamento,
        };

        if (editingCliente) {
          await updateClienteMutation.mutateAsync({
            id: editingCliente.id,
            ...clienteData,
          });
          toast({
            title: "Sucesso!",
            description: "Receita atualizada com sucesso.",
          });
        } else {
          await addClienteMutation.mutateAsync(clienteData);
          toast({
            title: "Sucesso!",
            description: "Receita adicionada com sucesso.",
          });
        }
        resetForm();
      } catch (error) {
        toast({
          title: "Erro",
          description: `Erro ao ${editingCliente ? 'atualizar' : 'adicionar'} receita.`,
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

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReceitas = filteredClientes.reduce((sum, cliente) => sum + Number(cliente.valor), 0);

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
          <h1 className="text-3xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600 mt-1">Gerencie as entradas de clientes</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="mt-4 lg:mt-0 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
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
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
      </div>

      {/* Formulário de Nova/Editar Receita */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCliente ? 'Editar Receita' : 'Nova Receita'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Cliente</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Cliente ABC"
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
              <Label htmlFor="data">Data de Pagamento</Label>
              <Input
                id="data"
                type="date"
                value={formData.data_pagamento}
                onChange={(e) => setFormData({...formData, data_pagamento: e.target.value})}
                required
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={addClienteMutation.isPending || updateClienteMutation.isPending}
              >
                {addClienteMutation.isPending || updateClienteMutation.isPending ? 'Salvando...' : 
                 editingCliente ? 'Atualizar' : 'Salvar'}
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

      {/* Resumo */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total de Receitas</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Número de Clientes</p>
            <p className="text-2xl font-bold text-blue-600">{filteredClientes.length}</p>
          </div>
        </div>
      </Card>

      {/* Lista de Receitas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Receitas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Data de Pagamento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{cliente.nome}</td>
                  <td className="py-3 px-4 font-medium text-green-600">
                    {formatCurrency(Number(cliente.valor))}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(cliente.data_pagamento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <EditDeleteActions
                      onEdit={() => handleEdit(cliente)}
                      onDelete={() => handleDelete(cliente.id)}
                      isLoading={deleteClienteMutation.isPending}
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

export default Receitas;
