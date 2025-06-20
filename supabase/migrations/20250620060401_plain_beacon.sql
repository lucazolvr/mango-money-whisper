/*
  # Database Performance and Security Optimizations

  1. Performance Improvements
    - Add indexes for frequently queried columns
    - Optimize foreign key relationships
    - Add composite indexes for common query patterns

  2. Data Integrity
    - Add missing constraints
    - Improve data validation
    - Add check constraints for business rules

  3. Security Enhancements
    - Improve RLS policies
    - Add audit triggers
    - Enhance data protection
*/

-- Performance Indexes
-- Indexes for transacoes table (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_transacoes_user_id_data ON transacoes(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria_id ON transacoes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo_data ON transacoes(tipo, data DESC);
CREATE INDEX IF NOT EXISTS idx_transacoes_created_at ON transacoes(created_at DESC);

-- Indexes for agendamentos table
CREATE INDEX IF NOT EXISTS idx_agendamentos_user_id_vencimento ON agendamentos(user_id, data_vencimento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status_vencimento ON agendamentos(status, data_vencimento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_notificacao ON agendamentos(notificacao_enviada, data_vencimento) WHERE status = 'pendente';

-- Indexes for metas table
CREATE INDEX IF NOT EXISTS idx_metas_user_id_status ON metas(user_id, status);
CREATE INDEX IF NOT EXISTS idx_metas_data_limite ON metas(data_limite) WHERE data_limite IS NOT NULL;

-- Indexes for categorias table
CREATE INDEX IF NOT EXISTS idx_categorias_user_id_tipo ON categorias(user_id, tipo);

-- Indexes for conexoes_bancarias table
CREATE INDEX IF NOT EXISTS idx_conexoes_user_id_status ON conexoes_bancarias(user_id, status);
CREATE INDEX IF NOT EXISTS idx_conexoes_pluggy_item ON conexoes_bancarias(pluggy_item_id);

-- Add missing constraints and validations
-- Ensure positive values for financial amounts
ALTER TABLE transacoes ADD CONSTRAINT check_valor_positivo CHECK (valor > 0);
ALTER TABLE metas ADD CONSTRAINT check_valor_alvo_positivo CHECK (valor_alvo > 0);
ALTER TABLE metas ADD CONSTRAINT check_valor_atual_nao_negativo CHECK (valor_atual >= 0);
ALTER TABLE agendamentos ADD CONSTRAINT check_valor_positivo CHECK (valor > 0);

-- Ensure logical date constraints
ALTER TABLE metas ADD CONSTRAINT check_data_limite_futura 
  CHECK (data_limite IS NULL OR data_limite >= created_at::date);

-- Ensure dias_antecedencia is reasonable
ALTER TABLE agendamentos ADD CONSTRAINT check_dias_antecedencia 
  CHECK (dias_antecedencia >= 0 AND dias_antecedencia <= 365);

-- Add unique constraint for user email in profiles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_email_unique' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
  END IF;
END $$;

-- Improve RLS policies with better performance
-- Drop existing policies and recreate with optimizations
DROP POLICY IF EXISTS "Usuários podem ver suas próprias transações" ON transacoes;
CREATE POLICY "Usuários podem ver suas próprias transações" 
  ON transacoes FOR SELECT 
  USING (auth.uid() = user_id);

-- Add policy for bulk operations
CREATE POLICY "Usuários podem fazer operações em lote em suas transações" 
  ON transacoes FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate user balance efficiently
CREATE OR REPLACE FUNCTION calcular_saldo_usuario(user_id_param UUID)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  saldo DECIMAL(12,2);
BEGIN
  SELECT COALESCE(
    SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 
    0
  ) INTO saldo
  FROM transacoes 
  WHERE user_id = user_id_param;
  
  RETURN saldo;
END;
$$;

-- Function to get monthly summary
CREATE OR REPLACE FUNCTION resumo_mensal_usuario(
  user_id_param UUID,
  mes_param INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
  ano_param INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE(
  receitas DECIMAL(12,2),
  despesas DECIMAL(12,2),
  saldo DECIMAL(12,2),
  total_transacoes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN t.tipo = 'receita' THEN t.valor ELSE 0 END), 0) as receitas,
    COALESCE(SUM(CASE WHEN t.tipo = 'despesa' THEN t.valor ELSE 0 END), 0) as despesas,
    COALESCE(SUM(CASE WHEN t.tipo = 'receita' THEN t.valor ELSE -t.valor END), 0) as saldo,
    COUNT(*)::INTEGER as total_transacoes
  FROM transacoes t
  WHERE t.user_id = user_id_param
    AND EXTRACT(MONTH FROM t.data) = mes_param
    AND EXTRACT(YEAR FROM t.data) = ano_param;
END;
$$;

-- Function to get category spending analysis
CREATE OR REPLACE FUNCTION analise_gastos_categoria(
  user_id_param UUID,
  periodo_dias INTEGER DEFAULT 30
)
RETURNS TABLE(
  categoria_nome TEXT,
  total_gasto DECIMAL(12,2),
  percentual DECIMAL(5,2),
  quantidade_transacoes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_despesas DECIMAL(12,2);
BEGIN
  -- Calculate total expenses for the period
  SELECT COALESCE(SUM(valor), 0) INTO total_despesas
  FROM transacoes t
  WHERE t.user_id = user_id_param
    AND t.tipo = 'despesa'
    AND t.data >= CURRENT_DATE - INTERVAL '1 day' * periodo_dias;
  
  -- Return category analysis
  RETURN QUERY
  SELECT 
    COALESCE(c.nome, 'Sem categoria') as categoria_nome,
    COALESCE(SUM(t.valor), 0) as total_gasto,
    CASE 
      WHEN total_despesas > 0 THEN (COALESCE(SUM(t.valor), 0) / total_despesas * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as percentual,
    COUNT(t.id)::INTEGER as quantidade_transacoes
  FROM transacoes t
  LEFT JOIN categorias c ON t.categoria_id = c.id
  WHERE t.user_id = user_id_param
    AND t.tipo = 'despesa'
    AND t.data >= CURRENT_DATE - INTERVAL '1 day' * periodo_dias
  GROUP BY c.nome
  ORDER BY total_gasto DESC;
END;
$$;

-- Audit trigger function for sensitive operations
CREATE OR REPLACE FUNCTION audit_financial_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log significant financial changes
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.valor != NEW.valor) THEN
    INSERT INTO audit_log (
      table_name,
      operation,
      user_id,
      old_values,
      new_values,
      changed_at
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      COALESCE(NEW.user_id, OLD.user_id),
      row_to_json(OLD),
      row_to_json(NEW),
      NOW()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for audit log (only users can see their own audit records)
CREATE POLICY "Users can view their own audit records" 
  ON audit_log FOR SELECT 
  USING (auth.uid() = user_id);

-- Add audit triggers to important tables
CREATE TRIGGER audit_transacoes_changes
  AFTER UPDATE OR DELETE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION audit_financial_changes();

CREATE TRIGGER audit_metas_changes
  AFTER UPDATE OR DELETE ON metas
  FOR EACH ROW EXECUTE FUNCTION audit_financial_changes();

-- Function to clean old audit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_audit_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM audit_log 
  WHERE changed_at < NOW() - INTERVAL '1 year';
END;
$$;

-- Improved function to update goal values with better performance
CREATE OR REPLACE FUNCTION atualizar_valor_meta_otimizado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_uuid UUID;
BEGIN
  user_uuid := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Update only goals that are active and created before or at the transaction date
  UPDATE metas 
  SET valor_atual = (
    SELECT COALESCE(SUM(
      CASE 
        WHEN t.tipo = 'receita' THEN t.valor 
        ELSE -t.valor 
      END
    ), 0)
    FROM transacoes t 
    WHERE t.user_id = user_uuid
    AND t.created_at >= metas.created_at
  ),
  updated_at = NOW()
  WHERE user_id = user_uuid 
  AND status = 'ativa';
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Replace existing triggers with optimized version
DROP TRIGGER IF EXISTS atualizar_meta_on_insert ON transacoes;
DROP TRIGGER IF EXISTS atualizar_meta_on_update ON transacoes;
DROP TRIGGER IF EXISTS atualizar_meta_on_delete ON transacoes;

CREATE TRIGGER atualizar_meta_on_insert_otimizado
  AFTER INSERT ON transacoes
  FOR EACH ROW EXECUTE FUNCTION atualizar_valor_meta_otimizado();

CREATE TRIGGER atualizar_meta_on_update_otimizado
  AFTER UPDATE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION atualizar_valor_meta_otimizado();

CREATE TRIGGER atualizar_meta_on_delete_otimizado
  AFTER DELETE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION atualizar_valor_meta_otimizado();

-- Add function to automatically update overdue schedules
CREATE OR REPLACE FUNCTION atualizar_agendamentos_atrasados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark overdue schedules
  UPDATE agendamentos 
  SET status = 'atrasado',
      updated_at = NOW()
  WHERE status = 'pendente' 
  AND data_vencimento < CURRENT_DATE;
  
  -- Reset notification flag for recurring schedules that need new notifications
  UPDATE agendamentos 
  SET notificacao_enviada = false,
      updated_at = NOW()
  WHERE status = 'pendente'
  AND recorrencia != 'unica'
  AND data_vencimento <= CURRENT_DATE + INTERVAL '1 day' * dias_antecedencia
  AND notificacao_enviada = true;
END;
$$;

-- Create a view for dashboard summary
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
  u.id as user_id,
  (SELECT calcular_saldo_usuario(u.id)) as saldo_atual,
  (SELECT COUNT(*) FROM transacoes t WHERE t.user_id = u.id AND t.data >= CURRENT_DATE - INTERVAL '30 days') as transacoes_mes,
  (SELECT COUNT(*) FROM metas m WHERE m.user_id = u.id AND m.status = 'ativa') as metas_ativas,
  (SELECT COUNT(*) FROM agendamentos a WHERE a.user_id = u.id AND a.status = 'pendente' AND a.data_vencimento <= CURRENT_DATE + INTERVAL '7 days') as agendamentos_proximos
FROM auth.users u;

-- Add RLS to the view
ALTER VIEW dashboard_summary SET (security_barrier = true);

-- Grant necessary permissions
GRANT SELECT ON dashboard_summary TO authenticated;
GRANT EXECUTE ON FUNCTION calcular_saldo_usuario(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resumo_mensal_usuario(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION analise_gastos_categoria(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION atualizar_agendamentos_atrasados() TO authenticated;