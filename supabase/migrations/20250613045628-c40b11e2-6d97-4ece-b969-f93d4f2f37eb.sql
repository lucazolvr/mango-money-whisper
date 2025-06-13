
-- Criar tabela para agendamentos de pagamentos
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  categoria_id UUID REFERENCES public.categorias,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  data_vencimento DATE NOT NULL,
  recorrencia TEXT DEFAULT 'unica' CHECK (recorrencia IN ('unica', 'semanal', 'mensal', 'anual')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  notificacao_enviada BOOLEAN DEFAULT false,
  dias_antecedencia INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para agendamentos
CREATE POLICY "Usuários podem ver seus próprios agendamentos" 
  ON public.agendamentos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios agendamentos" 
  ON public.agendamentos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios agendamentos" 
  ON public.agendamentos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios agendamentos" 
  ON public.agendamentos FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Função para verificar agendamentos próximos ao vencimento
CREATE OR REPLACE FUNCTION public.verificar_agendamentos_vencimento()
RETURNS void AS $$
DECLARE
  agendamento RECORD;
BEGIN
  -- Buscar agendamentos que estão próximos do vencimento e ainda não foram notificados
  FOR agendamento IN 
    SELECT * FROM public.agendamentos 
    WHERE status = 'pendente' 
    AND notificacao_enviada = false
    AND data_vencimento <= CURRENT_DATE + INTERVAL '1 day' * dias_antecedencia
  LOOP
    -- Marcar como notificado (aqui você pode integrar com um sistema de notificações)
    UPDATE public.agendamentos 
    SET notificacao_enviada = true 
    WHERE id = agendamento.id;
  END LOOP;
  
  -- Marcar agendamentos atrasados
  UPDATE public.agendamentos 
  SET status = 'atrasado' 
  WHERE status = 'pendente' 
  AND data_vencimento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
