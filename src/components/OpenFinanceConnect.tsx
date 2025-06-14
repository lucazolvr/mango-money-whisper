
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Shield, Building2, Loader2, Settings, Key, Check, ExternalLink, BookOpen, AlertCircle } from 'lucide-react';
import { usePluggy } from '@/hooks/usePluggy';
import { useToast } from '@/hooks/use-toast';

const OpenFinanceConnect = () => {
  const [pluggyCredentials, setPluggyCredentials] = useState({ 
    clientId: '', 
    clientSecret: '', 
    itemIds: '' // Múltiplos IDs separados por vírgula como no Actual
  });
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const { loading, checkStatus, getAccounts, getTransactions } = usePluggy();
  const { toast } = useToast();

  useEffect(() => {
    checkStoredCredentials();
  }, []);

  const checkStoredCredentials = async () => {
    const stored = localStorage.getItem('pluggy_credentials');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPluggyCredentials(parsed);
      setHasStoredCredentials(true);
      
      // Verificar status da conexão
      try {
        const status = await checkStatus();
        setConnectionStatus(status);
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        setConnectionStatus(false);
      }
    }
  };

  const savePluggyCredentials = () => {
    if (!pluggyCredentials.clientId || !pluggyCredentials.clientSecret || !pluggyCredentials.itemIds) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar formato dos Item IDs
    const itemIds = pluggyCredentials.itemIds.split(',').map(id => id.trim()).filter(Boolean);
    if (itemIds.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, forneça pelo menos um Item ID válido",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('pluggy_credentials', JSON.stringify({
      ...pluggyCredentials,
      itemIds: itemIds.join(', ') // Normalizar formato
    }));
    
    setHasStoredCredentials(true);
    setIsConfigDialogOpen(false);
    setConnectionStatus(null); // Reset status para verificar novamente
    
    toast({
      title: "Sucesso!",
      description: "Credenciais Pluggy configuradas com sucesso",
    });
  };

  const clearCredentials = () => {
    localStorage.removeItem('pluggy_credentials');
    setPluggyCredentials({ clientId: '', clientSecret: '', itemIds: '' });
    setHasStoredCredentials(false);
    setConnectionStatus(null);
    toast({
      title: "Credenciais removidas",
      description: "Configure novas credenciais quando desejar",
    });
  };

  const testConnection = async () => {
    if (!hasStoredCredentials) {
      toast({
        title: "Erro",
        description: "Configure as credenciais primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectionStatus(null); // Loading state
      
      const accounts = await getAccounts(pluggyCredentials.itemIds);
      setConnectionStatus(true);
      
      toast({
        title: "Sucesso!",
        description: `Conexão testada! Encontradas ${accounts.length} conta(s)`,
      });
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setConnectionStatus(false);
      
      toast({
        title: "Erro",
        description: "Falha ao conectar. Verifique suas credenciais e Item IDs",
        variant: "destructive",
      });
    }
  };

  const syncTransactions = async () => {
    if (!hasStoredCredentials) {
      toast({
        title: "Erro",
        description: "Configure as credenciais primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      const accounts = await getAccounts(pluggyCredentials.itemIds);
      
      if (accounts.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma conta encontrada",
          variant: "destructive",
        });
        return;
      }

      let totalTransactions = 0;
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      for (const account of accounts) {
        try {
          const result = await getTransactions(account.id, startDate);
          totalTransactions += result.transactions.length;
          
          // Aqui você pode processar e salvar as transações no seu banco de dados
          console.log(`Conta ${account.name}: ${result.transactions.length} transações`);
        } catch (error) {
          console.error(`Erro ao sincronizar conta ${account.name}:`, error);
        }
      }

      toast({
        title: "Sincronização concluída!",
        description: `${totalTransactions} transações dos últimos 30 dias sincronizadas de ${accounts.length} conta(s)`,
      });
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast({
        title: "Erro",
        description: "Falha na sincronização. Verifique suas credenciais",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    if (!hasStoredCredentials) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    if (connectionStatus === null) return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    if (connectionStatus === true) return <Check className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusText = () => {
    if (!hasStoredCredentials) return "⚠️ Configure suas credenciais Pluggy para começar";
    if (connectionStatus === null) return "🔄 Verificando conexão...";
    if (connectionStatus === true) return "✅ Conectado ao Pluggy com sucesso";
    return "❌ Erro na conexão - Verifique suas credenciais";
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-mango-900 mb-2">Open Finance</h1>
        <p className="text-mango-600">Conecte-se ao Pluggy usando suas credenciais (baseado no Actual Budget)</p>
      </div>

      {/* Configuração Pluggy */}
      <Card className="border-mango-200 bg-mango-50">
        <CardHeader>
          <CardTitle className="text-mango-900 flex items-center justify-between">
            <div className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              Configuração Pluggy
              {getStatusIcon()}
            </div>
            <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-mango-300 text-mango-700 hover:bg-mango-100">
                  <Settings className="mr-2 h-4 w-4" />
                  {hasStoredCredentials ? 'Reconfigurar' : 'Configurar'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Configurar Credenciais Pluggy</DialogTitle>
                  <DialogDescription>
                    Configure suas credenciais do Pluggy seguindo o padrão do Actual Budget
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Como configurar (igual ao Actual Budget):</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Acesse o <a href="https://dashboard.pluggy.ai/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Dashboard Pluggy</a></li>
                          <li>Obtenha seu Client ID e Client Secret</li>
                          <li>Conecte suas contas bancárias e obtenha os Item IDs</li>
                          <li>Cole as credenciais abaixo (múltiplos Item IDs separados por vírgula)</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="clientId">Client ID *</Label>
                    <Input
                      id="clientId"
                      type="text"
                      value={pluggyCredentials.clientId}
                      onChange={(e) => setPluggyCredentials({...pluggyCredentials, clientId: e.target.value})}
                      placeholder="Seu Client ID do Pluggy"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientSecret">Client Secret *</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      value={pluggyCredentials.clientSecret}
                      onChange={(e) => setPluggyCredentials({...pluggyCredentials, clientSecret: e.target.value})}
                      placeholder="Seu Client Secret do Pluggy"
                    />
                  </div>

                  <div>
                    <Label htmlFor="itemIds">Item IDs (separados por vírgula) *</Label>
                    <Input
                      id="itemIds"
                      type="text"
                      value={pluggyCredentials.itemIds}
                      onChange={(e) => setPluggyCredentials({...pluggyCredentials, itemIds: e.target.value})}
                      placeholder="78a3db91-2b6f-4f33-914f-0c5f29c5e6b1, 47cdfe32-bef9-4b82-9ea5-41b89f207749"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Item IDs das suas contas conectadas no Pluggy (como no Actual Budget)
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={savePluggyCredentials}
                      className="flex-1 bg-mango-500 hover:bg-mango-600"
                      disabled={!pluggyCredentials.clientId || !pluggyCredentials.clientSecret || !pluggyCredentials.itemIds}
                    >
                      Salvar Credenciais
                    </Button>
                    {hasStoredCredentials && (
                      <Button 
                        onClick={clearCredentials}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-mango-700">
              {getStatusText()}
            </p>
            {hasStoredCredentials && (
              <>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Client ID:</strong> {pluggyCredentials.clientId?.substring(0, 8)}...</p>
                  <p><strong>Item IDs:</strong> {pluggyCredentials.itemIds}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={testConnection}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="border-mango-300 text-mango-700 hover:bg-mango-100"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="mr-2 h-4 w-4" />
                    )}
                    Testar Conexão
                  </Button>
                  <Button 
                    onClick={syncTransactions}
                    size="sm"
                    disabled={loading || connectionStatus !== true}
                    className="bg-mango-500 hover:bg-mango-600"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Sincronizar Transações
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informação de Segurança */}
      <Card className="border-mango-200 bg-mango-50">
        <CardHeader>
          <CardTitle className="text-mango-900 flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            🔒 Segurança e Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-mango-700">
            Assim como o Actual Budget, utilizamos a API Pluggy de forma segura:
          </p>
          <ul className="text-sm text-mango-600 space-y-1 ml-4">
            <li>• Suas credenciais ficam armazenadas localmente no seu navegador</li>
            <li>• Não armazenamos dados bancários em nossos servidores</li>
            <li>• Comunicação criptografada com a API Pluggy</li>
            <li>• Conformidade com Open Finance e regulamentações do Banco Central</li>
          </ul>
          <div className="flex items-center space-x-2 mt-3">
            <ExternalLink className="h-4 w-4 text-mango-600" />
            <a 
              href="https://actualbudget.org/docs/advanced-features/open-finance/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-mango-600 hover:text-mango-800 underline"
            >
              Saiba mais sobre Open Finance no Actual Budget
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenFinanceConnect;
