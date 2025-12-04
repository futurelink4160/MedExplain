import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  question: string;
}

interface DrugInfo {
  name: string;
  trade_names?: string;
  generic_names?: string;
}

interface GeneInfo {
  symbol: string;
  name?: string;
}

interface EffectInfo {
  drug_name: string;
  gene_symbol: string;
  significance?: string;
  notes?: string;
  sentence?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { question }: RequestBody = await req.json();

    const words = question.toLowerCase().split(/\s+/);
    const commonGenes = ['cyp2d6', 'cyp2c19', 'cyp2c9', 'cyp3a4', 'cyp3a5', 'slco1b1', 'vkorc1', 'dpyd', 'tpmt', 'ugt1a1'];
    
    const foundGenes = words.filter(word =>
      commonGenes.some(gene => word.includes(gene) || gene.includes(word))
    );
    const drugKeywords = words.filter(word => word.length > 3);

    let contextData = '';

    if (drugKeywords.length > 0) {
      const orQuery = drugKeywords
        .map(drug => `name.ilike.%${drug}%,trade_names.ilike.%${drug}%,generic_names.ilike.%${drug}%`)
        .join(',');

      const { data: drugData } = await supabase
        .from('drugs')
        .select('name, trade_names, generic_names')
        .or(orQuery)
        .limit(3);

      if (drugData && drugData.length > 0) {
        const drugInfo = drugData as DrugInfo[];
        contextData += `\n\nDrugs found: ${drugInfo.map(d => d.name).join(', ')}`;

        const drugName = drugInfo[0].name;
        const { data: effectsData } = await supabase
          .from('pgx_variant_effects')
          .select('drug_name, gene_symbol, significance, notes, sentence')
          .ilike('drug_name', `%${drugName}%`)
          .limit(5);

        if (effectsData && effectsData.length > 0) {
          const effects = effectsData as EffectInfo[];
          contextData += `\n\nPharmacogenomic data for ${drugName}:\n`;
          effects.forEach(effect => {
            if (effect.sentence) {
              contextData += `- ${effect.sentence}\n`;
            } else if (effect.notes) {
              contextData += `- ${effect.notes}\n`;
            }
          });
        }
      }
    }

    if (foundGenes.length > 0) {
      const orQuery = foundGenes.map(gene => `symbol.ilike.%${gene}%`).join(',');
      
      const { data: geneData } = await supabase
        .from('genes')
        .select('symbol, name')
        .or(orQuery)
        .limit(3);

      if (geneData && geneData.length > 0) {
        const genes = geneData as GeneInfo[];
        contextData += `\n\nGenes found: ${genes.map(g => `${g.symbol}${g.name ? ` (${g.name})` : ''}`).join(', ')}`;
      }
    }

    const { data: docData } = await supabase
      .from('documents')
      .select('content')
      .textSearch('content', question.split(' ').join(' | '))
      .limit(2);

    if (docData && docData.length > 0) {
      contextData += `\n\nAdditional context:\n${docData.map(d => d.content.substring(0, 300)).join('\n')}`;
    }

    if (!contextData.trim()) {
      return new Response(
        JSON.stringify({
          answer: "I don't have specific information about that in my database. Try asking about specific medications (like warfarin, clopidogrel) or genes (like CYP2D6, CYP2C19).",
          sources: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful pharmacist assistant providing educational information about medications and genetics. 

IMPORTANT GUIDELINES:
- Explain medical information in simple, everyday language that anyone can understand
- Avoid medical jargon - if you must use technical terms, explain them immediately
- Use analogies and examples when helpful
- Break complex information into simple, digestible points
- Be warm and conversational
- Always remind users this is educational information only and they should consult their healthcare provider
- Never provide medical advice, dosing recommendations, or diagnoses

Your goal is to make pharmacogenomics understandable to someone with no medical background.`
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nDatabase information:\n${contextData}\n\nPlease explain this in simple, easy-to-understand language.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const answer = openaiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ answer, sources: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});