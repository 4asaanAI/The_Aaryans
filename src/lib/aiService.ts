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

function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  const keywords: Record<string, string[]> = {
    admission: ['admission', 'admissions', 'apply', 'enroll', 'enrollment', 'join', 'register'],
    timing: ['time', 'timing', 'hours', 'schedule', 'when', 'open', 'close'],
    facilities: ['facility', 'facilities', 'playground', 'library', 'lab', 'computer', 'sports'],
    activities: ['activity', 'activities', 'extracurricular', 'clubs', 'events'],
    teachers: ['teacher', 'teachers', 'staff', 'faculty', 'qualification'],
    fees: ['fee', 'fees', 'cost', 'price', 'tuition', 'payment'],
    contact: ['contact', 'phone', 'email', 'address', 'location', 'reach'],
    curriculum: ['curriculum', 'syllabus', 'course', 'subjects', 'teach']
  };

  const responses: Record<string, string> = {
    admission: "We welcome students throughout the year! Our admission process includes:\n- Application form submission\n- Parent-child interaction\n- Document verification\n\nFor detailed information, please contact us at +1 (555) 123-4567 or visit our office during school hours.",
    timing: "Our school timings are:\n- Monday to Friday: 8:00 AM - 2:30 PM\n- Office hours: 7:30 AM - 3:30 PM\n\nWe're closed on weekends and public holidays. Feel free to contact us during office hours!",
    facilities: "The Aaryans Primary School offers excellent facilities including:\n- Modern classrooms with smart boards\n- Well-stocked library\n- Science and computer labs\n- Sports ground and playground\n- Safe and secure campus\n\nWould you like to schedule a campus tour?",
    activities: "We offer diverse activities for holistic development:\n- Sports (Cricket, Basketball, Athletics)\n- Arts and Crafts\n- Music and Dance\n- Science Club\n- Annual cultural events\n\nThese activities help students discover and develop their talents!",
    teachers: "Our dedicated team of qualified teachers brings years of experience in primary education. All our teachers are certified and regularly participate in professional development programs to ensure the best learning experience for students.",
    fees: "For detailed information about fee structure and payment plans, please contact our office at +1 (555) 123-4567 or email info@primaryschool.edu. We offer flexible payment options and can discuss this during the admission process.",
    contact: "You can reach us at:\n- Phone: +1 (555) 123-4567\n- Email: info@primaryschool.edu\n- Address: 123 Education Lane, Learning City, LC 12345\n\nOur office is open Monday to Friday, 7:30 AM - 3:30 PM.",
    curriculum: "We follow a comprehensive curriculum focused on:\n- Strong foundation in core subjects\n- Hands-on learning experiences\n- Development of critical thinking\n- Character building\n\nOur approach ensures academic excellence while nurturing well-rounded individuals."
  };

  for (const [category, keywordList] of Object.entries(keywords)) {
    if (keywordList.some(keyword => lowerMessage.includes(keyword))) {
      return responses[category];
    }
  }

  return "Thank you for your question! I'm here to help you learn more about The Aaryans Primary School. You can ask me about:\n- Admissions process\n- School timings\n- Facilities and infrastructure\n- Activities and programs\n- Our teaching staff\n\nFeel free to ask anything, or contact us directly at +1 (555) 123-4567!";
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
