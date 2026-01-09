import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PgxResult {
  gene: string;
  star_alleles?: string[];
  phenotype?: string;
  activity_score?: number;
}

interface RequestBody {
  markdownText: string;
  pgxResults?: PgxResult[];
  patientData?: {
    age?: string;
    sex?: string;
    medications?: string;
    allergies?: string;
    symptoms?: string;
  };
  role: 'clinician' | 'patient';
  medicationName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { markdownText, pgxResults, patientData, role, medicationName }: RequestBody = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    if (role === 'patient') {
      systemPrompt = `You are a medical assistant creating concise audio summaries for patients. Your summary will be read aloud using text-to-speech.

GUIDELINES:
- Create a summary that takes 2-3 minutes to read aloud (approximately 250-350 words)
- Use simple, everyday language that anyone can understand
- Focus on the most important and actionable information
- Avoid medical jargon unless absolutely necessary, and explain terms simply
- Structure the summary clearly with smooth transitions suitable for audio
- CRITICAL: Use conditional language for genetic information (e.g., "If you have certain variants...", "Some people with...") - NEVER assume the patient has specific variants
- End with clear next steps or when to contact a doctor
- Make it conversational and easy to listen to

FOCUS AREAS FOR PATIENT SUMMARIES:
1. What is this medication and why might it be prescribed
2. How genetics CAN affect this medication (using conditional language)
3. Key genes that may be relevant (in general terms)
4. Important things to watch for or discuss with your doctor
5. Clear action steps`;

      userPrompt = `Create an audio-friendly summary of this medication information for a patient.

${medicationName ? `Medication: ${medicationName}\n` : ''}${patientData?.symptoms ? `Patient symptoms: ${patientData.symptoms}\n` : ''}${pgxResults && pgxResults.length > 0 ? `\nRelevant genes mentioned: ${pgxResults.map(r => `${r.gene}${r.phenotype ? ` (${r.phenotype})` : ''}`).join(', ')}\n` : ''}\nFull information:\n${markdownText.substring(0, 3000)}

Create a clear, conversational summary suitable for text-to-speech that takes 2-3 minutes to read aloud.`;
    } else {
      systemPrompt = `You are a clinical pharmacist creating concise audio summaries for clinicians. Your summary will be read aloud using text-to-speech.

GUIDELINES:
- Create a summary that takes 2-3 minutes to read aloud (approximately 250-350 words)
- Use appropriate medical terminology for a clinical audience
- Focus on clinically actionable information
- Structure the summary clearly with smooth transitions suitable for audio
- Prioritize safety considerations and monitoring requirements
- End with clear clinical recommendations
- Make it professional but conversational for audio listening

FOCUS AREAS FOR CLINICIAN SUMMARIES:
1. Pharmacogenomic context and gene-drug interactions
2. Specific dosing considerations and adjustments needed
3. Risk assessment and critical monitoring parameters
4. Drug interactions of clinical significance
5. Clear clinical action items and recommendations`;

      userPrompt = `Create an audio-friendly clinical summary of this pharmacogenomic analysis.

${medicationName ? `Medication: ${medicationName}\n` : ''}${patientData?.age ? `Patient age: ${patientData.age}\n` : ''}${patientData?.sex ? `Patient sex: ${patientData.sex}\n` : ''}${patientData?.medications ? `Current medications: ${patientData.medications}\n` : ''}${pgxResults && pgxResults.length > 0 ? `\nPharmacogenomic results: ${pgxResults.map(r => `${r.gene}: ${r.phenotype || 'N/A'}${r.activity_score !== undefined ? ` (AS: ${r.activity_score})` : ''}`).join(', ')}\n` : ''}\nFull analysis:\n${markdownText.substring(0, 3000)}

Create a clear, professional summary suitable for text-to-speech that takes 2-3 minutes to read aloud.`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 600
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.statusText} - ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const summary = openaiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ summary }),
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