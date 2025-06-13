
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Clock, Repeat } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Agendamento } from '@/hooks/useAgendamentos';

interface AgendamentoFormProps {
  onSubmit: (agendamento: Omit<Agendamento, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: Partial<Agendamento>;
}

const AgendamentoForm = ({ onSubmit, onCancel, initialData }: AgendamentoFormProps) => {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    valor: initialData?.valor || 0,
    tipo: initialData?.tipo || 'despesa' as 'receita' | 'despesa',
    data_vencimento: initialData?.data_vencimento || '',
    recorrencia: initialData?.recorrencia || 'unica' as 'unica' | 'semanal' | 'mensal' | 'anual',
    categoria_id: initialData?.categoria_id || '',
    dias_antecedencia: initialData?.dias_antecedencia || 3,
    status: initialData?.status || 'pendente' as 'pendente' | 'pago' | 'atrasado' | 'cancelado',
    notificacao_enviada: initialData?.notificacao_enviada || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredCategories = categories.filter(cat => cat.tipo === formData.tipo);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-mango-500" />
          <span>{initialData ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Conta de luz"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mango-500" />
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => handleChange('valor', parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => handleChange('data_vencimento', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={formData.categoria_id} onValueChange={(value) => handleChange('categoria_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recorrencia">Recorrência</Label>
              <div className="relative">
                <Repeat className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mango-500" />
                <Select value={formData.recorrencia} onValueChange={(value) => handleChange('recorrencia', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unica">Única</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dias_antecedencia">Dias para Notificação</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mango-500" />
                <Input
                  id="dias_antecedencia"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.dias_antecedencia}
                  onChange={(e) => handleChange('dias_antecedencia', parseInt(e.target.value) || 3)}
                  className="pl-10"
                  placeholder="3"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Detalhes adicionais sobre o agendamento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-mango-500 hover:bg-mango-600">
              {initialData ? 'Atualizar' : 'Criar'} Agendamento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AgendamentoForm;
