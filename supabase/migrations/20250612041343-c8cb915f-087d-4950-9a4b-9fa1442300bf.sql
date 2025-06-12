
-- Criar tabela para armazenar conexões bancárias do Pluggy
CREATE TABLE public.conexoes_bancarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  pluggy_item_id TEXT NOT NULL,
  connector_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para conexões bancárias
ALTER TABLE public.conexoes_bancarias ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para conexões bancárias
CREATE POLICY "Users can view their own bank connections" 
  ON public.conexoes_bancarias 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank connections" 
  ON public.conexoes_bancarias 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank connections" 
  ON public.conexoes_bancarias 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank connections" 
  ON public.conexoes_bancarias 
  FOR DELETE 
  USING (auth.uid() = user_id);
