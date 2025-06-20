import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    if (!message || !userId) {
      throw new Error("Message and userId are required");
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OpenAI API key não configurada");
    }

    // Configurar Supabase para buscar contexto do usuário
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar transações recentes do usuário para contexto
    const { data: transactions } = await supabase
      .from("transacoes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Buscar saldo atual
    const { data: balance } = await supabase.rpc("calcular_saldo", {
      user_id_param: userId,
    });

    // Criar contexto para o AI
    const contextMessage = `
Você é o Mango 🥭, um assistente financeiro amigável e especializado em ajudar com finanças pessoais.

Contexto do usuário:
- Saldo atual: R$ ${balance || 0}
- Últimas transações: ${
      transactions
        ? JSON.stringify(transactions.slice(0, 5))
        : "Nenhuma transação"
    }

Suas capacidades:
- Ajudar a registrar gastos e receitas
- Analisar padrões de gastos
- Dar dicas de economia
- Explicar conceitos financeiros
- Responder perguntas sobre finanças pessoais

Sempre seja: amigável, use emojis, seja prático e dê conselhos úteis.
    `;

    // Chamar OpenAI com modelo mais barato (gpt-4o-mini)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Modelo mais barato
        messages: [
          { role: "system", content: contextMessage },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log("AI Response:", aiResponse);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro no chat AI:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
