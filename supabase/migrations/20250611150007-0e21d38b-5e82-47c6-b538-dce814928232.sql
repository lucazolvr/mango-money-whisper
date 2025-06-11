
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome_completo TEXT,
  email TEXT,
  telefone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de categorias
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#FF6B35',
  icone TEXT DEFAULT 'Tag',
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transações
CREATE TABLE public.transacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  categoria_id UUID REFERENCES public.categorias,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de metas
CREATE TABLE public.metas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_alvo DECIMAL(10,2) NOT NULL,
  valor_atual DECIMAL(10,2) DEFAULT 0,
  data_limite DATE,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'pausada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Políticas de segurança para categorias
CREATE POLICY "Usuários podem ver suas próprias categorias" 
  ON public.categorias FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias categorias" 
  ON public.categorias FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias" 
  ON public.categorias FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias categorias" 
  ON public.categorias FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas de segurança para transações
CREATE POLICY "Usuários podem ver suas próprias transações" 
  ON public.transacoes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias transações" 
  ON public.transacoes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações" 
  ON public.transacoes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias transações" 
  ON public.transacoes FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas de segurança para metas
CREATE POLICY "Usuários podem ver suas próprias metas" 
  ON public.metas FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias metas" 
  ON public.metas FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas" 
  ON public.metas FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias metas" 
  ON public.metas FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'nome_completo',
    new.email
  );
  
  -- Inserir categorias padrão
  INSERT INTO public.categorias (user_id, nome, tipo, cor, icone) VALUES
    (new.id, 'Alimentação', 'despesa', '#FF6B35', 'UtensilsCrossed'),
    (new.id, 'Transporte', 'despesa', '#3B82F6', 'Car'),
    (new.id, 'Casa', 'despesa', '#10B981', 'Home'),
    (new.id, 'Lazer', 'despesa', '#8B5CF6', 'Gamepad2'),
    (new.id, 'Trabalho', 'receita', '#059669', 'Briefcase'),
    (new.id, 'Freelance', 'receita', '#DC2626', 'Users');
  
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para atualizar valor atual das metas baseado nas transações
CREATE OR REPLACE FUNCTION public.atualizar_valor_meta()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar todas as metas do usuário
  UPDATE public.metas 
  SET valor_atual = (
    SELECT COALESCE(SUM(
      CASE 
        WHEN t.tipo = 'receita' THEN t.valor 
        ELSE -t.valor 
      END
    ), 0)
    FROM public.transacoes t 
    WHERE t.user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND t.created_at >= metas.created_at
  ),
  updated_at = now()
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers para atualizar metas quando transações mudam
CREATE TRIGGER atualizar_meta_on_insert
  AFTER INSERT ON public.transacoes
  FOR EACH ROW EXECUTE PROCEDURE public.atualizar_valor_meta();

CREATE TRIGGER atualizar_meta_on_update
  AFTER UPDATE ON public.transacoes
  FOR EACH ROW EXECUTE PROCEDURE public.atualizar_valor_meta();

CREATE TRIGGER atualizar_meta_on_delete
  AFTER DELETE ON public.transacoes
  FOR EACH ROW EXECUTE PROCEDURE public.atualizar_valor_meta();
