
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  onDateChange: (startDate: string, endDate: string) => void;
  className?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

const DateFilter = ({ onDateChange, className, initialStartDate, initialEndDate }: DateFilterProps) => {
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');

  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      onDateChange(initialStartDate, initialEndDate);
    }
  }, [initialStartDate, initialEndDate, onDateChange]);

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    onDateChange(startStr, endStr);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    onDateChange(startStr, endStr);
  };

  const handlePreviousMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    onDateChange(startStr, endStr);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    onDateChange('', '');
  };

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-4", className)}>
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium text-gray-900">Filtros de Data</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="start-date">Data Inicial</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate) onDateChange(e.target.value, endDate);
            }}
          />
        </div>
        <div>
          <Label htmlFor="end-date">Data Final</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (startDate) onDateChange(startDate, e.target.value);
            }}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickFilter(7)}
        >
          Últimos 7 dias
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickFilter(15)}
        >
          Últimos 15 dias
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickFilter(30)}
        >
          Últimos 30 dias
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCurrentMonth}
        >
          Mês Atual
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePreviousMonth}
        >
          Mês Anterior
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClearFilter}
          className="text-red-600 hover:text-red-700"
        >
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};

export default DateFilter;
