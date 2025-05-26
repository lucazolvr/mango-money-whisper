
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, Plus, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const quickActions = [
    { label: 'Registrar gasto', icon: Plus },
    { label: 'Ver relatórios', icon: TrendingUp },
    { label: 'Falar com Mango', icon: Mic },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simular resposta do bot
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage: Message = {
        id: messages.length + 2,
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputMessage('');
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('gasto') || input.includes('gastei')) {
      return 'Perfeito! Para registrar um gasto, me conta: quanto você gastou e com o quê? Por exemplo: "Gastei R$ 50 no supermercado" 🛒';
    }
    
    if (input.includes('receita') || input.includes('ganhei')) {
      return 'Ótimo! Me conta quanto você recebeu e de onde veio essa grana? Por exemplo: "Recebi R$ 800 do freelance" 💰';
    }
    
    if (input.includes('saldo') || input.includes('quanto tenho')) {
      return 'Seu saldo atual é de R$ 2.500,50! Você está indo bem este mês, gastou 22% menos que o planejado 📈';
    }
    
    if (input.includes('relatório') || input.includes('resumo')) {
      return 'Claro! Este mês você gastou mais com alimentação (35%) e transporte (25%). Quer que eu mostre os detalhes? 📊';
    }
    
    return 'Entendi! Posso te ajudar a registrar gastos e receitas, ver seu saldo, criar relatórios ou responder dúvidas sobre suas finanças. O que você gostaria de fazer? 😊';
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    toast({
      title: isListening ? "Gravação parada" : "Escutando...",
      description: isListening ? "Sua mensagem foi enviada!" : "Fale agora para registrar sua transação",
    });
    
    if (!isListening) {
      // Simular transcrição de voz
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
        </div>

        {/* Input de Mensagem */}
        <div className="p-4 border-t border-mango-100">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem ou clique no microfone..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 border-mango-200 focus:border-mango-500"
            />
            <Button
              onClick={handleVoiceInput}
              variant="outline"
              size="icon"
              className={`border-mango-200 hover:bg-mango-50 ${isListening ? 'bg-red-500 text-white' : ''}`}
            >
              <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
            <Button 
              onClick={handleSendMessage}
              className="bg-mango-500 hover:bg-mango-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBot;
