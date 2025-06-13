
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Calendar, Clock, DollarSign, AlertTriangle, CheckCircle, Trash2, Edit, Bell } from 'lucide-react';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import AgendamentoForm from './AgendamentoForm';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Agendamentos = () => {
  const {
    agendamentos,
    loading,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    marcarComoPago,
    getAgendamentosProximosVencimento,
    getAgendamentosAtrasados,
  } = useAgendamentos();

  const [showForm, setShowForm] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);

  const handleCreateAgendamento = async (data) => {
    await createAgendamento(data);
    setShowForm(false);
  };

  const handleEditAgendamento = async (data) => {
    if (editingAgendamento) {
      await updateAgendamento(editingAgendamento.id, data);
      setEditingAgendamento(null);
      setShowForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pago': return 'bg-green-100 text-green-800 border-green-200';
      case 'atrasado': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'pago': return 'Pago';
      case 'atrasado': return 'Atrasado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const formatDataVencimento = (data: string) => {
    const dataVencimento = new Date(data);
    
    if (isToday(dataVencimento)) {
      return 'Hoje';
    } else if (isTomorrow(dataVencimento)) {
      return 'Amanhã';
    } else {
      const diasRestantes = differenceInDays(dataVencimento, new Date());
      if (diasRestantes > 0 && diasRestantes <= 7) {
        return `Em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`;
      }
      return format(dataVencimento, 'dd/MM/yyyy', { locale: ptBR });
    }
  };

  const proximosVencimentos = getAgendamentosProximosVencimento();
  const atrasados = getAgendamentosAtrasados();
  const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente');
  const agendamentosPagos = agendamentos.filter(a => a.status === 'pago');

  if (loading) {
    return <div className="flex justify-center items-center py-8">Carregando agendamentos...</div>;
  }

  if (showForm) {
    return (
      <AgendamentoForm
        onSubmit={editingAgendamento ? handleEditAgendamento : handleCreateAgendamento}
        onCancel={() => {
          setShowForm(false);
          setEditingAgendamento(null);
        }}
        initialData={editingAgendamento}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-mango-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-mango-500" />
              <div>
                <p className="text-sm text-mango-600">Total</p>
                <p className="text-2xl font-bold text-mango-900">{agendamentos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-800">{agendamentosPendentes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">Atrasados</p>
                <p className="text-2xl font-bold text-red-800">{atrasados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Pagos</p>
                <p className="text-2xl font-bold text-green-800">{agendamentosPagos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificações de vencimentos próximos */}
      {proximosVencimentos.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <Bell className="h-5 w-5" />
              <span>Vencimentos Próximos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proximosVencimentos.slice(0, 3).map((agendamento) => (
                <div key={agendamento.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-orange-900">{agendamento.titulo}</p>
                    <p className="text-sm text-orange-600">{formatDataVencimento(agendamento.data_vencimento)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-900">
                      R$ {agendamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão para novo agendamento */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-mango-900">Agendamentos</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-mango-500 hover:bg-mango-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="atrasados">Atrasados</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <AgendamentosList 
            agendamentos={agendamentos}
            onEdit={(agendamento) => {
              setEditingAgendamento(agendamento);
              setShowForm(true);
            }}
            onDelete={deleteAgendamento}
            onMarkAsPaid={marcarComoPago}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            formatDataVencimento={formatDataVencimento}
          />
        </TabsContent>

        <TabsContent value="pendentes">
          <AgendamentosList 
            agendamentos={agendamentosPendentes}
            onEdit={(agendamento) => {
              setEditingAgendamento(agendamento);
              setShowForm(true);
            }}
            onDelete={deleteAgendamento}
            onMarkAsPaid={marcarComoPago}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            formatDataVencimento={formatDataVencimento}
          />
        </TabsContent>

        <TabsContent value="atrasados">
          <AgendamentosList 
            agendamentos={atrasados}
            onEdit={(agendamento) => {
              setEditingAgendamento(agendamento);
              setShowForm(true);
            }}
            onDelete={deleteAgendamento}
            onMarkAsPaid={marcarComoPago}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            formatDataVencimento={formatDataVencimento}
          />
        </TabsContent>

        <TabsContent value="pagos">
          <AgendamentosList 
            agendamentos={agendamentosPagos}
            onEdit={(agendamento) => {
              setEditingAgendamento(agendamento);
              setShowForm(true);
            }}
            onDelete={deleteAgendamento}
            onMarkAsPaid={marcarComoPago}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            formatDataVencimento={formatDataVencimento}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para listar os agendamentos
const AgendamentosList = ({ 
  agendamentos, 
  onEdit, 
  onDelete, 
  onMarkAsPaid, 
  getStatusColor, 
  getStatusLabel, 
  formatDataVencimento 
}) => {
  if (agendamentos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Calendar className="h-12 w-12 text-mango-300 mx-auto mb-4" />
          <p className="text-mango-600">Nenhum agendamento encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {agendamentos.map((agendamento) => (
        <Card key={agendamento.id} className="border-mango-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-mango-900">{agendamento.titulo}</h3>
                  <Badge className={getStatusColor(agendamento.status)}>
                    {getStatusLabel(agendamento.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-mango-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDataVencimento(agendamento.data_vencimento)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span className={agendamento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                      R$ {agendamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="capitalize">{agendamento.recorrencia}</span>
                  </div>
                </div>

                {agendamento.descricao && (
                  <p className="text-sm text-mango-500 mt-2">{agendamento.descricao}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {agendamento.status === 'pendente' && (
                  <Button
                    size="sm"
                    onClick={() => onMarkAsPaid(agendamento.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(agendamento)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(agendamento.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Agendamentos;
