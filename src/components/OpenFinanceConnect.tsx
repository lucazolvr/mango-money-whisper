
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Shield, Building2, Loader2, Settings, Key, Check, Search } from 'lucide-react';
import { usePluggy, Connector } from '@/hooks/usePluggy';
import { useToast } from '@/hooks/use-toast';

const OpenFinanceConnect = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [pluggyCredentials, setPluggyCredentials] = useState({ clientId: '', clientSecret: '' });
  const [itemId, setItemId] = useState('');
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const { loading, getConnectors, connectBank, getItemById } = usePluggy();
  const { toast } = useToast();

  useEffect(() => {
    checkStoredCredentials();
    if (hasStoredCredentials) {
      loadConnectors();
    }
  }, [hasStoredCredentials]);

  const checkStoredCredentials = () => {
    const stored = localStorage.getItem('pluggy_credentials');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPluggyCredentials(parsed);
      setHasStoredCredentials(true);
    }
  };

  const savePluggyCredentials = () => {
    if (!pluggyCredentials.clientId || !pluggyCredentials.clientSecret) {
      toast({
        title: "Erro",
        description: "Por favor, preencha ambos os campos",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('pluggy_credentials', JSON.stringify(pluggyCredentials));
    setHasStoredCredentials(true);
    setIsConfigDialogOpen(false);
    toast({
      title: "Sucesso!",
      description: "Credenciais Pluggy salvas com sucesso",
    });
    loadConnectors();
  };

  const clearCredentials = () => {
    localStorage.removeItem('pluggy_credentials');
    setPluggyCredentials({ clientId: '', clientSecret: '' });
    setHasStoredCredentials(false);
    setConnectors([]);
    toast({
      title: "Credenciais removidas",
      description: "Você pode configurar novas credenciais quando desejar",
    });
  };

  const loadConnectors = async () => {
    try {
      const data = await getConnectors();
      setConnectors(data);
    } catch (error) {
      console.error('Erro ao carregar conectores:', error);
    }
  };

  const handleConnect = async () => {
    if (!selectedConnector) return;

    try {
      await connectBank(selectedConnector.id, selectedConnector.name, {
        user: credentials.username,
        password: credentials.password
      });
      
      setIsConnectDialogOpen(false);
      setCredentials({ username: '', password: '' });
      setSelectedConnector(null);
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  const handleSearchItemById = async () => {
    if (!itemId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um Item ID válido",
        variant: "destructive",
      });
      return;
    }

    try {
      const item = await getItemById(itemId);
      toast({
        title: "Sucesso!",
        description: `Item encontrado: ${item.connector?.name || 'Item conectado'}`,
      });
    } catch (error) {
      console.error('Erro ao buscar item:', error);
    }
  };

  const popularBanks = connectors
    .filter(c => ['nubank', 'itau', 'bradesco', 'santander', 'banco do brasil', 'caixa'].some(bank => 
      c.name.toLowerCase().includes(bank)
    ))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-mango-900 mb-2">Open Finance</h1>
        <p className="text-mango-600">Conecte suas contas bancárias de forma segura</p>
      </div>

      {/* Configuração Pluggy */}
      <Card className="border-mango-200 bg-mango-50">
        <CardHeader>
          <CardTitle className="text-mango-900 flex items-center justify-between">
            <div className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              Configuração Pluggy
              {hasStoredCredentials && <Check className="ml-2 h-4 w-4 text-green-600" />}
            </div>
            <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-mango-300 text-mango-700 hover:bg-mango-100">
                  <Settings className="mr-2 h-4 w-4" />
                  {hasStoredCredentials ? 'Reconfigurar' : 'Configurar'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar Credenciais Pluggy</DialogTitle>
                  <DialogDescription>
                    Insira suas credenciais da API Pluggy para conectar bancos
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      type="text"
                      value={pluggyCredentials.clientId}
                      onChange={(e) => setPluggyCredentials({...pluggyCredentials, clientId: e.target.value})}
                      placeholder="Seu Client ID do Pluggy"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      value={pluggyCredentials.clientSecret}
                      onChange={(e) => setPluggyCredentials({...pluggyCredentials, clientSecret: e.target.value})}
                      placeholder="Seu Client Secret do Pluggy"
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Shield className="inline h-4 w-4 mr-1" />
                      Obtenha suas credenciais no <a href="https://dashboard.pluggy.ai/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Dashboard Pluggy</a>
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={savePluggyCredentials}
                      className="flex-1 bg-mango-500 hover:bg-mango-600"
                      disabled={!pluggyCredentials.clientId || !pluggyCredentials.clientSecret}
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
          {hasStoredCredentials ? (
            <p className="text-sm text-mango-700">
              ✅ Credenciais Pluggy configuradas com sucesso. Agora você pode conectar seus bancos.
            </p>
          ) : (
            <p className="text-sm text-mango-700">
              ⚠️ Configure suas credenciais Pluggy para começar a conectar bancos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Buscar por Item ID */}
      {hasStoredCredentials && (
        <Card className="border-mango-200">
          <CardHeader>
            <CardTitle className="text-mango-900 flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Buscar por Item ID
            </CardTitle>
            <CardDescription>
              Se você já tem um Item ID do Pluggy, pode buscá-lo diretamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite seu Item ID do Pluggy"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSearchItemById}
                disabled={loading || !itemId.trim()}
                className="bg-mango-500 hover:bg-mango-600"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-mango-600">
              O Item ID é fornecido quando você conecta uma conta bancária através do Pluggy
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informação de Segurança */}
      <Card className="border-mango-200 bg-mango-50">
        <CardHeader>
          <CardTitle className="text-mango-900 flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            🔒 Segurança Garantida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-mango-700">
            Utilizamos a tecnologia Open Finance regulamentada pelo Banco Central. 
            Suas credenciais são criptografadas e processadas diretamente pela API Pluggy, 
            seguindo os mais altos padrões de segurança bancária.
          </p>
        </CardContent>
      </Card>

      {/* Bancos Disponíveis */}
      {hasStoredCredentials && (
        <Card className="border-mango-200">
          <CardHeader>
            <CardTitle className="text-mango-900 flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Bancos Disponíveis
            </CardTitle>
            <CardDescription>
              Conecte-se aos principais bancos do Brasil
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-mango-500" />
                <span className="ml-2 text-mango-700">Carregando bancos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularBanks.map((connector) => (
                  <Dialog key={connector.id} open={isConnectDialogOpen && selectedConnector?.id === connector.id} onOpenChange={(open) => {
                    setIsConnectDialogOpen(open);
                    if (!open) {
                      setSelectedConnector(null);
                      setCredentials({ username: '', password: '' });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <div 
                        className="flex items-center justify-between p-4 border border-mango-200 rounded-lg cursor-pointer hover:bg-mango-50 transition-colors"
                        onClick={() => setSelectedConnector(connector)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {connector.imageUrl ? (
                              <img src={connector.imageUrl} alt={connector.name} className="w-8 h-8 object-contain" />
                            ) : (
                              <Building2 className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                          <span className="text-mango-900 font-medium">{connector.name}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Disponível</Badge>
                      </div>
                    </DialogTrigger>
                    
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <CreditCard className="mr-2 h-5 w-5" />
                          Conectar {connector.name}
                        </DialogTitle>
                        <DialogDescription>
                          Insira suas credenciais de acesso ao {connector.name} para conectar sua conta.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="username">Usuário/CPF</Label>
                          <Input
                            id="username"
                            type="text"
                            value={credentials.username}
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                            placeholder="Digite seu usuário ou CPF"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="password">Senha</Label>
                          <Input
                            id="password"
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            placeholder="Digite sua senha"
                          />
                        </div>
                        
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <Shield className="inline h-4 w-4 mr-1" />
                            Suas credenciais são processadas de forma segura e não ficam armazenadas em nossos servidores.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={handleConnect}
                          className="w-full bg-mango-500 hover:bg-mango-600"
                          disabled={loading || !credentials.username || !credentials.password}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Conectando...
                            </>
                          ) : (
                            'Conectar Conta'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
            
            {!loading && popularBanks.length === 0 && connectors.length === 0 && (
              <div className="text-center py-8">
                <p className="text-mango-600">Nenhum banco disponível no momento.</p>
                <Button 
                  onClick={loadConnectors}
                  variant="outline"
                  className="mt-4 border-mango-300 text-mango-700 hover:bg-mango-50"
                >
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OpenFinanceConnect;
