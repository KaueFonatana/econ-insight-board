
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DespesasMensais from '@/components/despesas/DespesasMensais';
import DespesasModelo from '@/components/despesas/DespesasModelo';

const Despesas = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
        <p className="text-gray-600 mt-1">Controle financeiro de despesas mensais e modelos recorrentes</p>
      </div>

      <Tabs defaultValue="mensais" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mensais">🧾 Despesas Mensais</TabsTrigger>
          <TabsTrigger value="modelo">🧩 Despesas Modelo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mensais">
          <DespesasMensais />
        </TabsContent>
        
        <TabsContent value="modelo">
          <DespesasModelo />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Despesas;
