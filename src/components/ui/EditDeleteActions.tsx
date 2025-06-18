
import { useState } from 'react';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditDeleteActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const EditDeleteActions = ({ onEdit, onDelete, isLoading = false }: EditDeleteActionsProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onEdit}
        disabled={isLoading}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onDelete}
        disabled={isLoading}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default EditDeleteActions;
