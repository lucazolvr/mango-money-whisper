
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';

const AddTransactionForm = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    categoria_id: '',
    data: new Date().toISOString().split('T')[0]
  });

  const { categories } = useCategories();
  const { addTransaction } = useTransactions();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor || !formData.categoria_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addTransaction({
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        tipo: formData.tipo,
        categoria_id: formData.categoria_id,
        data: formData.data
      });

      toast({
        title: "Sucesso!",
        description: "Transação adicionada com sucesso",
      });

      setFormData({
        descricao: '',
        valor: '',
        tipo: 'despesa',
        categoria_id: '',
        data: new Date().toISOString().split('T')[0]
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a transação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.tipo === formData.tipo);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-mango-500 hover:bg-mango-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-mango-900">Adicionar Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Ex: Almoço no restaurante"
              className="border-mango-200 focus:border-mango-500"
            />
          </div>

          <div>
            <Label htmlFor="valor">Valor *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
              placeholder="0,00"
              className="border-mango-200 focus:border-mango-500"
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: 'receita' | 'despesa') => 
                setFormData(prev => ({ ...prev, tipo: value, categoria_id: '' }))
              }
            >
              <SelectTrigger className="border-mango-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <Select
              value={formData.categoria_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value }))}
            >
              <SelectTrigger className="border-mango-200">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              className="border-mango-200 focus:border-mango-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-mango-200 text-mango-700 hover:bg-mango-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-mango-500 hover:bg-mango-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionForm;
