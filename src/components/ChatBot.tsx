
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, Plus, TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: 'Oi! Eu sou o Mango 🥭 Vou te ajudar a organizar suas finanças. Como posso te ajudar hoje?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const quickActions = [
    { label: 'Registrar gasto', icon: Plus },
    { label: 'Ver relatórios', icon: TrendingUp },
    { label: 'Falar com Mango', icon: Mic },
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Chamar a Edge Function do Supabase
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: inputMessage,
          userId: user.id
        }
      });

      if (error) {
        console.error('Erro ao chamar Edge Function:', error);
        throw error;
      }

      const botMessage: Message = {
        id: messages.length + 2,
        content: data.response || 'Desculpe, não consegui processar sua mensagem.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Erro no chat:', error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro no chat",
        description: "Não foi possível processar sua mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    toast({
      title: isListening ? "Gravação parada" : "Escutando...",
      description: isListening ? "Sua mensagem foi enviada!" : "Fale agora para registrar sua transação",
    });
    
    if (!isListening) {
      // Simular transcrição de voz (implementar WebSpeech API depois)
      setTimeout(() => {
        setInputMessage("Gastei R$ 85 no supermercado hoje");
        setIsListening(false);
      }, 3000);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  return (
    <Card className="h-[600px] flex flex-col border-mango-200">
      <CardHeader className="bg-gradient-to-r from-mango-500 to-mango-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-2">
          <span>🥭</span>
          <span>Chat com Mango</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Ações Rápidas */}
        <div className="p-4 border-b border-mango-100">
          <p className="text-sm text-mango-700 mb-2">Ações rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="cursor-pointer hover:bg-mango-50 border-mango-300 text-mango-700"
                onClick={() => handleQuickAction(action.label)}
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-mango-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-mango-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-gray-600">Mango está pensando...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input de Mensagem */}
        <div className="p-4 border-t border-mango-100">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem ou clique no microfone..."
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              className="flex-1 border-mango-200 focus:border-mango-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleVoiceInput}
              variant="outline"
              size="icon"
              className={`border-mango-200 hover:bg-mango-50 ${isListening ? 'bg-red-500 text-white' : ''}`}
              disabled={isLoading}
            >
              <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
            <Button 
              onClick={handleSendMessage}
              className="bg-mango-500 hover:bg-mango-600"
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBot;
