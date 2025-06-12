
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProfile } from '@/hooks/useProfile';

interface ProfileEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileEditForm = ({ open, onOpenChange }: ProfileEditFormProps) => {
  const { profile, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        nome_completo: profile.nome_completo || '',
        email: profile.email || '',
        telefone: profile.telefone || ''
      });
    }
  }, [profile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        nome_completo: formData.nome_completo || null,
        email: formData.email || null,
        telefone: formData.telefone || null
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_completo">Nome Completo</Label>
            <Input
              id="nome_completo"
              value={formData.nome_completo}
              onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
              placeholder="Seu nome completo"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              placeholder="(11) 99999-9999"
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
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditForm;
