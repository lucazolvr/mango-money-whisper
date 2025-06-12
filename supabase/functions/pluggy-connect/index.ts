
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    const pluggyClientId = Deno.env.get('PLUGGY_CLIENT_ID');
    const pluggyClientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET');
    
    if (!pluggyClientId || !pluggyClientSecret) {
      throw new Error('Credenciais do Pluggy não configuradas');
    }

    // Configurar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter token de acesso do Pluggy
    const getAccessToken = async () => {
      const tokenResponse = await fetch('https://api.pluggy.ai/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: pluggyClientId,
          clientSecret: pluggyClientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Erro ao obter token do Pluggy');
      }

      const tokenData = await tokenResponse.json();
      return tokenData.accessToken;
    };

    switch (action) {
      case 'getConnectors':
        // Buscar conectores disponíveis (bancos)
        const accessToken = await getAccessToken();
        
        const connectorsResponse = await fetch('https://api.pluggy.ai/connectors', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!connectorsResponse.ok) {
          throw new Error('Erro ao buscar conectores');
        }

        const connectors = await connectorsResponse.json();
        
        return new Response(JSON.stringify({ 
          connectors: connectors.results,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'createItem':
        // Criar nova conexão com instituição financeira
        const token = await getAccessToken();
        
        const itemResponse = await fetch('https://api.pluggy.ai/items', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connectorId: data.connectorId,
            parameters: data.parameters,
          }),
        });

        if (!itemResponse.ok) {
          throw new Error('Erro ao criar conexão');
        }

        const item = await itemResponse.json();
        
        // Salvar conexão no banco de dados
        const { error: saveError } = await supabase
          .from('conexoes_bancarias')
          .insert({
            user_id: data.userId,
            pluggy_item_id: item.id,
            connector_id: data.connectorId,
            status: item.status,
            instituicao: data.connectorName,
          });

        if (saveError) {
          console.error('Erro ao salvar conexão:', saveError);
        }

        return new Response(JSON.stringify({ 
          item,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getAccounts':
        // Buscar contas de um item conectado
        const accountsToken = await getAccessToken();
        
        const accountsResponse = await fetch(`https://api.pluggy.ai/accounts?itemId=${data.itemId}`, {
          headers: {
            'Authorization': `Bearer ${accountsToken}`,
          },
        });

        if (!accountsResponse.ok) {
          throw new Error('Erro ao buscar contas');
        }

        const accounts = await accountsResponse.json();
        
        return new Response(JSON.stringify({ 
          accounts: accounts.results,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'getTransactions':
        // Buscar transações de uma conta
        const transactionsToken = await getAccessToken();
        
        const transactionsResponse = await fetch(`https://api.pluggy.ai/transactions?accountId=${data.accountId}&from=${data.from}&to=${data.to}`, {
          headers: {
            'Authorization': `Bearer ${transactionsToken}`,
          },
        });

        if (!transactionsResponse.ok) {
          throw new Error('Erro ao buscar transações');
        }

        const transactions = await transactionsResponse.json();
        
        return new Response(JSON.stringify({ 
          transactions: transactions.results,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Ação não reconhecida');
    }

  } catch (error) {
    console.error('Erro na função Pluggy:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
