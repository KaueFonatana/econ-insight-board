
import { useState, useMemo } from 'react';
import { Plus, Search, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import EditDeleteActions from '@/components/ui/EditDeleteActions';
import DespesaChart from './DespesaChart';
import { useDespesasMensais, useAddDespesaMensal, useUpdateDespesaMensal, useDeleteDespesaMensal, useMarcarComoPago, useGerarNovoMes, DespesaMensal } from '@/hooks/useDespesas';
import { useToast } from '@/hooks/use-toast';

const DespesasMensais = () => {
  const { data: despesas = [], isLoading } = useDespesasMensais();
  const addDespesaMutation = useAddDespesaMensal();
  const updateDespesaMutation = useUpdateDespesaMensal();
  const deleteDespesaMutation = useDeleteDespesaMensal();
  const marcarComoPagoMutation = useMarcarComoPago();
  const gerarNovoMesMutation = useGerarNovoMes();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<DespesaMensal | null>(null);
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: '',
    valor: '',
    data_vencimento: '',
    mes_referencia: '',
  });

  const mesesDisponiveis = useMemo(() => {
    const meses = new Set(despesas.map(d => d.mes_referencia));
    return Array.from(meses).sort();
  }, [despesas]);

  const despesasFiltradas = useMemo(() => {
    return despesas.filter(despesa => {
      const matchMes = !filtroMes || despesa.mes_referencia === filtroMes;
      const matchStatus = filtroStatus === 'todos' || 
        (filtroStatus === 'pago' && despesa.data_pagamento) ||
        (filtroStatus === 'pendente' && !despesa.data_pagamento);
      const matchSearch = despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        despesa.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchMes && matchStatus && matchSearch;
    });
  }, [despesas, filtroMes, filtroStatus, searchTerm]);

  const totais = useMemo(() => {
    const totalPrevisto = despesasFiltradas.reduce((sum, d) => sum + Number(d.valor), 0);
    const totalPago = despesasFiltradas.filter(d => d.data_pagamento).reduce((sum, d) => sum + Number(d.valor), 0);
    const totalPendente = totalPrevisto - totalPago;
    const percentualExecucao = totalPrevisto > 0 ? (totalPago / totalPrevisto) * 100 : 0;

    return { totalPrevisto, totalPago, totalPendente, percentualExecucao };
  }, [despesasFiltradas]);

  const resetForm = () => {
    setFormData({ descricao: '', categoria: '', valor: '', data_vencimento: '', mes_referencia: '' });
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

  const handleMarcarComoPago = async (id: string) => {
    try {
      await marcarComoPagoMutation.mutateAsync(id);
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

  const handleGerarNovoMes = async () => {
    const proximoMes = new Date();
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    const mesReferencia = `${String(proximoMes.getMonth() + 1).padStart(2, '0')}/${proximoMes.getFullYear()}`;
    
    try {
      await gerarNovoMesMutation.mutateAsync(mesReferencia);
      toast({
        title: "Sucesso!",
        description: `Despesas do mês ${mesReferencia} geradas com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar despesas do novo mês.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (despesa: DespesaMensal) => {
    if (despesa.data_pagamento) {
      return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Despesas Mensais</h2>
          <p className="text-gray-600 mt-1">Controle de despesas pagas e pendentes</p>
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          <Button 
            onClick={handleGerarNovoMes}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={gerarNovoMesMutation.isPending}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {gerarNovoMesMutation.isPending ? 'Gerando...' : 'Gerar Novo Mês'}
          </Button>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <Label htmlFor="filtro-mes">Filtrar por Mês</Label>
          <Select value={filtroMes} onValueChange={setFiltroMes}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os meses</SelectItem>
              {mesesDisponiveis.map(mes => (
                <SelectItem key={mes} value={mes}>{mes}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-4">
          <Label htmlFor="filtro-status">Filtrar por Status</Label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Previsto</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totais.totalPrevisto)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Pago</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totais.totalPago)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Pendente</h3>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totais.totalPendente)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">% Execução</h3>
          <p className="text-2xl font-bold text-purple-600">{totais.percentualExecucao.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Gráfico */}
      {filtroMes && <DespesaChart despesas={despesasFiltradas} />}

      {/* Formulário */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Label htmlFor="data_vencimento">Data Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="mes_referencia">Mês Referência</Label>
              <Input
                id="mes_referencia"
                value={formData.mes_referencia}
                onChange={(e) => setFormData({...formData, mes_referencia: e.target.value})}
                placeholder="MM/YYYY"
                required
              />
            </div>
            <div className="md:col-span-5 flex gap-2">
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700"
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
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Mês</th>
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
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(despesa.data_vencimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {despesa.data_pagamento ? 
                      new Date(despesa.data_pagamento).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(despesa)}</td>
                  <td className="py-3 px-4 text-gray-600">{despesa.mes_referencia}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {!despesa.data_pagamento && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarcarComoPago(despesa.id)}
                          className="text-green-600 hover:text-green-700"
                          disabled={marcarComoPagoMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <EditDeleteActions
                        onEdit={() => handleEdit(despesa)}
                        onDelete={() => handleDelete(despesa.id)}
                        isLoading={deleteDespesaMutation.isPending}
                      />
                    </div>
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
