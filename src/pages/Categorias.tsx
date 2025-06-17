
import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useCategorias, useAddCategoria, useCustosVariaveis } from '@/hooks/useSupabaseFinancialData';
import { useToast } from '@/hooks/use-toast';

const Categorias = () => {
  const { data: categorias = [], isLoading } = useCategorias();
  const { data: custosVariaveis = [] } = useCustosVariaveis();
  const addCategoriaMutation = useAddCategoria();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome) {
      try {
        await addCategoriaMutation.mutateAsync({
          nome: formData.nome,
        });
        setFormData({ nome: '' });
        setShowForm(false);
        toast({
          title: "Sucesso!",
          description: "Categoria adicionada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao adicionar categoria.",
          variant: "destructive",
        });
      }
    }
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular uso das categorias
  const categoriaUso = custosVariaveis.reduce((acc, custo) => {
    const categoriaNome = custo.categoria?.nome || 'Sem categoria';
    acc[categoriaNome] = (acc[categoriaNome] || 0) + Number(custo.valor);
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-1">Gerencie categorias para custos variáveis</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="mt-4 lg:mt-0 bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Busca */}
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

      {/* Formulário de Nova Categoria */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Categoria</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome da Categoria</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Marketing, Logística, Ferramentas..."
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={addCategoriaMutation.isPending}
              >
                {addCategoriaMutation.isPending ? 'Salvando...' : 'Salvar'}
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
            <h3 className="text-lg font-semibold text-gray-900">Total de Categorias</h3>
            <p className="text-2xl font-bold text-purple-600">{filteredCategorias.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Categorias em Uso</p>
            <p className="text-2xl font-bold text-green-600">
              {Object.keys(categoriaUso).length}
            </p>
          </div>
        </div>
      </Card>

      {/* Lista de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategorias.map((categoria) => {
          const totalGasto = categoriaUso[categoria.nome] || 0;
          const quantidadeUsos = custosVariaveis.filter(c => c.categoria?.nome === categoria.nome).length;
          
          return (
            <Card key={categoria.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{categoria.nome}</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Gasto</span>
                  <span className="font-medium text-purple-600">
                    {formatCurrency(totalGasto)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantidade de Usos</span>
                  <span className="font-medium text-gray-900">{quantidadeUsos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    totalGasto > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {totalGasto > 0 ? 'Em uso' : 'Não utilizada'}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Categoria mais usada */}
      {Object.keys(categoriaUso).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking de Categorias por Gasto</h3>
          <div className="space-y-3">
            {Object.entries(categoriaUso)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([categoria, valor], index) => (
                <div key={categoria} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{categoria}</span>
                  </div>
                  <span className="font-bold text-purple-600">{formatCurrency(valor)}</span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Categorias;
