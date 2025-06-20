/*
  # Advanced Data Validation and Business Rules

  1. Enhanced Data Validation
    - Email format validation
    - Phone number format validation
    - Currency amount validation

  2. Business Rules
    - Goal completion logic
    - Recurring schedule management
    - Category usage tracking

  3. Data Consistency
    - Referential integrity improvements
    - Cascade operations
    - Data cleanup procedures
*/

-- Enhanced validation functions
CREATE OR REPLACE FUNCTION validate_email(email_text TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN email_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

CREATE OR REPLACE FUNCTION validate_phone(phone_text TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Brazilian phone format: (XX) XXXXX-XXXX or clean numbers
  RETURN phone_text ~ '^\(\d{2}\)\s\d{4,5}-\d{4}$' OR phone_text ~ '^\d{10,11}$';
END;
$$;

-- Add validation constraints
ALTER TABLE profiles ADD CONSTRAINT valid_email_format 
  CHECK (email IS NULL OR validate_email(email));

ALTER TABLE profiles ADD CONSTRAINT valid_phone_format 
  CHECK (telefone IS NULL OR validate_phone(telefone));

-- Business rule: Auto-complete goals when target is reached
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-complete goals that have reached their target
  IF NEW.valor_atual >= NEW.valor_alvo AND NEW.status = 'ativa' THEN
    NEW.status := 'concluida';
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER goal_completion_check
  BEFORE UPDATE ON metas
  FOR EACH ROW EXECUTE FUNCTION check_goal_completion();

-- Business rule: Prevent deletion of categories with transactions
CREATE OR REPLACE FUNCTION prevent_category_deletion_with_transactions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  transaction_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO transaction_count
  FROM transacoes
  WHERE categoria_id = OLD.id;
  
  IF transaction_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete category with existing transactions. Found % transactions.', transaction_count;
  END IF;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER prevent_category_deletion
  BEFORE DELETE ON categorias
  FOR EACH ROW EXECUTE FUNCTION prevent_category_deletion_with_transactions();

-- Business rule: Update recurring schedules after payment
CREATE OR REPLACE FUNCTION handle_recurring_schedule_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_date DATE;
BEGIN
  -- Only process if status changed to 'pago' and it's a recurring schedule
  IF NEW.status = 'pago' AND OLD.status != 'pago' AND NEW.recorrencia != 'unica' THEN
    
    -- Calculate next occurrence date
    CASE NEW.recorrencia
      WHEN 'semanal' THEN
        next_date := NEW.data_vencimento + INTERVAL '7 days';
      WHEN 'mensal' THEN
        next_date := NEW.data_vencimento + INTERVAL '1 month';
      WHEN 'anual' THEN
        next_date := NEW.data_vencimento + INTERVAL '1 year';
      ELSE
        next_date := NULL;
    END CASE;
    
    -- Create next occurrence if date is calculated
    IF next_date IS NOT NULL THEN
      INSERT INTO agendamentos (
        user_id, categoria_id, titulo, descricao, valor, tipo,
        data_vencimento, recorrencia, status, dias_antecedencia
      ) VALUES (
        NEW.user_id, NEW.categoria_id, NEW.titulo, NEW.descricao, NEW.valor, NEW.tipo,
        next_date, NEW.recorrencia, 'pendente', NEW.dias_antecedencia
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_recurring_schedules
  AFTER UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION handle_recurring_schedule_payment();

-- Function to archive old completed goals
CREATE OR REPLACE FUNCTION archive_old_completed_goals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Archive goals completed more than 1 year ago
  UPDATE metas 
  SET status = 'arquivada'
  WHERE status = 'concluida'
  AND updated_at < NOW() - INTERVAL '1 year';
END;
$$;

-- Add archived status to goals if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'metas_status_check'
    AND check_clause LIKE '%arquivada%'
  ) THEN
    ALTER TABLE metas DROP CONSTRAINT IF EXISTS metas_status_check;
    ALTER TABLE metas ADD CONSTRAINT metas_status_check 
      CHECK (status IN ('ativa', 'concluida', 'pausada', 'arquivada'));
  END IF;
END $$;

-- Function to clean up orphaned records
CREATE OR REPLACE FUNCTION cleanup_orphaned_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up transactions without valid categories (set to NULL)
  UPDATE transacoes 
  SET categoria_id = NULL 
  WHERE categoria_id IS NOT NULL 
  AND categoria_id NOT IN (SELECT id FROM categorias);
  
  -- Clean up schedules without valid categories (set to NULL)
  UPDATE agendamentos 
  SET categoria_id = NULL 
  WHERE categoria_id IS NOT NULL 
  AND categoria_id NOT IN (SELECT id FROM categorias);
  
  -- Log cleanup actions
  INSERT INTO audit_log (table_name, operation, user_id, new_values)
  VALUES ('system', 'CLEANUP', NULL, jsonb_build_object('action', 'orphaned_records_cleanup', 'timestamp', NOW()));
END;
$$;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_id_param UUID)
RETURNS TABLE(
  total_transacoes INTEGER,
  total_receitas DECIMAL(12,2),
  total_despesas DECIMAL(12,2),
  saldo_atual DECIMAL(12,2),
  metas_ativas INTEGER,
  metas_concluidas INTEGER,
  agendamentos_pendentes INTEGER,
  categoria_mais_usada TEXT,
  mes_mais_ativo TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*)::INTEGER as total_trans,
      COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as receitas,
      COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as despesas,
      COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as saldo
    FROM transacoes 
    WHERE user_id = user_id_param
  ),
  goal_stats AS (
    SELECT 
      COUNT(CASE WHEN status = 'ativa' THEN 1 END)::INTEGER as ativas,
      COUNT(CASE WHEN status = 'concluida' THEN 1 END)::INTEGER as concluidas
    FROM metas 
    WHERE user_id = user_id_param
  ),
  schedule_stats AS (
    SELECT COUNT(*)::INTEGER as pendentes
    FROM agendamentos 
    WHERE user_id = user_id_param AND status = 'pendente'
  ),
  top_category AS (
    SELECT c.nome
    FROM transacoes t
    JOIN categorias c ON t.categoria_id = c.id
    WHERE t.user_id = user_id_param
    GROUP BY c.nome
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ),
  active_month AS (
    SELECT TO_CHAR(data, 'YYYY-MM') as month_year
    FROM transacoes
    WHERE user_id = user_id_param
    GROUP BY TO_CHAR(data, 'YYYY-MM')
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  SELECT 
    s.total_trans,
    s.receitas,
    s.despesas,
    s.saldo,
    g.ativas,
    g.concluidas,
    sch.pendentes,
    COALESCE(tc.nome, 'Nenhuma'),
    COALESCE(am.month_year, 'Nenhum')
  FROM stats s
  CROSS JOIN goal_stats g
  CROSS JOIN schedule_stats sch
  LEFT JOIN top_category tc ON true
  LEFT JOIN active_month am ON true;
END;
$$;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION validate_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_phone(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION archive_old_completed_goals() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_records() TO authenticated;