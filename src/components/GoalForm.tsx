
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGoals, Goal } from '@/hooks/useGoals';

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  onSuccess?: () => void;
}

const GoalForm = ({ open, onOpenChange, goal, onSuccess }: GoalFormProps) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor_alvo: '',
    data_limite: ''
  });
  const [loading, setLoading] = useState(false);
  const { createGoal, updateGoal } = useGoals();

  useEffect(() => {
    if (goal) {
      setFormData({
        titulo: goal.titulo,
        descricao: goal.descricao || '',
        valor_alvo: goal.valor_alvo.toString(),
        data_limite: goal.data_limite || ''
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        valor_alvo: '',
        data_limite: ''
      });
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const goalData = {
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        valor_alvo: parseFloat(formData.valor_alvo),
        data_limite: formData.data_limite || null
      };

      if (goal) {
        await updateGoal(goal.id, goalData);
      } else {
        await createGoal(goalData);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          <DialogDescription>
            {goal ? 'Atualize os dados da sua meta financeira' : 'Crie uma nova meta financeira para acompanhar seus objetivos'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título da Meta</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              placeholder="Ex: Viagem para Europa"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descreva sua meta..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="valor_alvo">Valor Alvo (R$)</Label>
            <Input
              id="valor_alvo"
              type="number"
              min="0"
              step="0.01"
              value={formData.valor_alvo}
              onChange={(e) => setFormData({...formData, valor_alvo: e.target.value})}
              placeholder="0,00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="data_limite">Data Limite (opcional)</Label>
            <Input
              id="data_limite"
              type="date"
              value={formData.data_limite}
              onChange={(e) => setFormData({...formData, data_limite: e.target.value})}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-mango-500 hover:bg-mango-600">
              {loading ? 'Salvando...' : (goal ? 'Atualizar' : 'Criar Meta')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalForm;
