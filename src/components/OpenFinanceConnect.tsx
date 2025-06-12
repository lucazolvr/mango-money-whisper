
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Shield, Building2, Loader2 } from 'lucide-react';
import { usePluggy, Connector } from '@/hooks/usePluggy';

const OpenFinanceConnect = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const { loading, getConnectors, connectBank } = usePluggy();

  useEffect(() => {
    loadConnectors();
  }, []);

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

      {/* Bancos Populares */}
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
          
          {!loading && popularBanks.length === 0 && (
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
    </div>
  );
};

export default OpenFinanceConnect;
