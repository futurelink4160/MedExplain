import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  transcript: string;
}

interface ParsedFields {
  age?: string;
  gender?: string;
  role?: string;
  medication?: string;
  question?: string;
  symptoms?: string;
  duration?: string;
  otherMeds?: string;
  medicalHistory?: string;
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

    const { transcript }: RequestBody = await req.json();

    if (!transcript || transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Transcript is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an AI assistant that extracts structured medical form data from natural language dictation.

Your task is to parse the user's spoken narrative and extract the following fields:
- age: The person's age (just the number)
- gender: Male, Female, Non-binary, or Prefer not to say
- role: Patient, Caregiver, Doctor, or Clinician
- medication: The medication they want information about
- question: Their main question or concern
- symptoms: Current symptoms or side effects
- duration: How long symptoms have been occurring
- otherMeds: Other medications or supplements they're taking
- medicalHistory: Additional relevant medical history, conditions, allergies, etc.

Rules:
1. Extract only information explicitly mentioned in the transcript
2. Leave fields empty if not mentioned
3. For age, extract only the numeric value
4. For gender, normalize to one of the allowed options
5. For role, normalize to one of: Patient, Caregiver, Doctor, Clinician
6. Be intelligent about context - if someone says "I'm 45" extract age as "45"
7. If someone describes their situation, extract it as their question/concern
8. Return ONLY valid JSON with no additional text or explanation

Example transcript: "Hi, I'm 45 years old, female, and I'm a patient. I'm taking sertraline and experiencing headaches and dizziness for about 2 weeks. I also take vitamin D. I have a history of anxiety and depression."

Expected output:
{
  "age": "45",
  "gender": "Female",
  "role": "Patient",
  "medication": "sertraline",
  "question": "Experiencing headaches and dizziness",
  "symptoms": "headaches, dizziness",
  "duration": "2 weeks",
  "otherMeds": "vitamin D",
  "medicalHistory": "history of anxiety and depression"
}`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Parse this dictation and return ONLY the JSON object:\n\n${transcript}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const parsedContent = openaiData.choices[0].message.content;
    
    let parsedFields: ParsedFields;
    try {
      parsedFields = JSON.parse(parsedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parsedContent);
      throw new Error('Failed to parse AI response');
    }

    return new Response(
      JSON.stringify({ fields: parsedFields, success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});