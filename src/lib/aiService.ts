import { getSchoolData } from './schoolData';

export interface AIResponse {
  response: string;
  success: boolean;
  error?: string;
}

export async function generateAIResponse(userMessage: string): Promise<AIResponse> {
  try {
    const schoolData = await getSchoolData();
    const context = buildContext(schoolData);

    const response = await queryAI(userMessage, context);

    return {
      response,
      success: true
    };
  } catch (error) {
    console.error('Error generating AI response:', error);

    try {
      const fallbackResponse = getFallbackResponse(userMessage);

      return {
        response: fallbackResponse,
        success: true
      };
    } catch (fallbackError) {
      return {
        response: "I apologize, but I'm having trouble processing your question right now. Please try again or contact us directly at +1 (555) 123-4567 or info@primaryschool.edu.",
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

function buildContext(schoolData: any[]): string {
  let context = `You are a helpful assistant for The Aaryans Primary School. Answer questions based on the following information:\n\n`;

  const categories = {
    basic_info: 'School Information',
    features: 'Key Features',
    facilities: 'Facilities',
    activities: 'Activities',
    teachers: 'Our Teachers',
    faq: 'Frequently Asked Questions',
    contact: 'Contact Information',
    admissions: 'Admissions'
  };

  for (const [key, label] of Object.entries(categories)) {
    const items = schoolData.filter(item => item.category === key);
    if (items.length > 0) {
      context += `\n${label}:\n`;
      items.forEach(item => {
        context += `- ${item.title}: ${item.content}\n`;
      });
    }
  }

  context += `\nInstructions:
- Answer questions clearly and concisely based only on the information provided above
- If asked about something not covered in the information, politely say you don't have that specific information and suggest contacting the school directly
- Be friendly, helpful, and professional
- Keep responses focused and not too long (2-3 sentences is ideal)
- If asked about admissions, encourage them to book a tour or contact the school`;

  return context;
}

async function queryAI(userMessage: string, context: string): Promise<string> {
  const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

  if (!HF_API_KEY) {
    console.log('No Hugging Face API key found, using fallback response');
    return getFallbackResponse(userMessage);
  }

  const models = [
    'mistralai/Mistral-7B-Instruct-v0.2',
    'google/flan-t5-large',
    'microsoft/DialoGPT-large'
  ];

  for (const model of models) {
    try {
      const response = await tryModel(model, userMessage, context, HF_API_KEY);
      if (response) {
        return response;
      }
    } catch (error) {
      console.log(`Model ${model} failed, trying next...`);
      continue;
    }
  }

  console.log('All AI models failed, using fallback response');
  return getFallbackResponse(userMessage);
}

async function tryModel(modelUrl: string, userMessage: string, context: string, apiKey: string): Promise<string | null> {
  const HF_API_URL = `https://api-inference.huggingface.co/models/${modelUrl}`;
  const prompt = `${context}\n\nUser Question: ${userMessage}\n\nAssistant Response:`;

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      if (response.status === 503) {
        const errorData = await response.json();
        if (errorData.estimated_time && errorData.estimated_time < 30) {
          await new Promise(resolve => setTimeout(resolve, (errorData.estimated_time + 2) * 1000));
          return tryModel(modelUrl, userMessage, context, apiKey);
        }
      }
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      return cleanResponse(data[0].generated_text);
    }

    return null;
  } catch (error) {
    console.error(`Error with model ${modelUrl}:`, error);
    return null;
  }
}


function cleanResponse(text: string): string {
  let cleaned = text.trim();

  if (cleaned.includes('User Question:')) {
    cleaned = cleaned.split('User Question:')[0].trim();
  }

  if (cleaned.includes('\n\n')) {
    cleaned = cleaned.split('\n\n')[0].trim();
  }

  return cleaned || "I'd be happy to help! Could you please rephrase your question?";
}
