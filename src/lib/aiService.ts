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

    const response = await queryOpenAI(userMessage, context);

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
        response: "I apologize, but I'm having trouble processing your question right now. Please try again or contact us directly at 9837975353, 8755998955 or principal@theaaryans.com.",
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

function buildContext(schoolData: any[]): string {
  let context = '';

  const categories = {
    basic_info: 'School Information',
    features: 'Key Features',
    facilities: 'Facilities',
    objectives: 'Our Objectives',
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

  return context;
}

async function queryOpenAI(userMessage: string, context: string): Promise<string> {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.log('No OpenAI API key found, using fallback response');
    return getFallbackResponse(userMessage);
  }

  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  const systemPrompt = `You are a helpful assistant for THE AARYANS - an institution of the Vedic Educational Foundation, also known as "Chariot of Knowledge". Your role is to answer questions about the school based on the following information:

${context}

Instructions:
- Answer questions clearly and concisely based only on the information provided above
- If asked about something not covered in the information, politely say you don't have that specific information and suggest contacting the school directly at 9837975353, 8755998955 or principal@theaaryans.com
- Be friendly, helpful, and professional
- Keep responses focused and not too long (2-4 sentences is ideal)
- If asked about admissions, encourage them to book a tour or contact the school
- Use a warm, welcoming tone appropriate for parents and families
- Remember: THE AARYANS is a CBSE affiliated co-educational institution founded in 2008 on an 8-acre campus in Meerut`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 250,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', response.status, errorData);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 500) {
        throw new Error('OpenAI service is temporarily unavailable.');
      }

      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    }

    throw new Error('Invalid response format from OpenAI');
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
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
    admission: "Admissions are open for 2024-25! Our admission process includes:\n- Application form submission\n- Campus tour\n- Document verification\n\nFor detailed information, please contact us at 9837975353, 8755998955 or email principal@theaaryans.com",
    timing: "For information about school timings, please contact our office at 9837975353 or 8755998955. We're located at 62 KM Stone, NH-58, Modipuram Bypass, Meerut.",
    facilities: "THE AARYANS offers excellent facilities including:\n- Sports and games facilities\n- Library and study rooms\n- Seminar and workshop spaces\n- Educational excursions\n- Transport services\n- 8-acre peaceful campus\n\nWould you like to schedule a campus tour?",
    activities: "We offer diverse activities for holistic development through activity-oriented education. Our programs focus on personality development, communication skills, and social growth. Contact us to learn more!",
    teachers: "THE AARYANS has experienced and trained staff dedicated to academic excellence. Our educators focus on helping students develop their intellectual, emotional, social, physical, artistic, creative and spiritual potentials.",
    fees: "For detailed information about fee structure 2025-26 and payment plans, please contact our office at 9837975353, 8755998955 or email principal@theaaryans.com",
    contact: "You can reach us at:\n- Phone: 9837975353, 8755998955\n- Email: principal@theaaryans.com\n- Address: 62 KM Stone, NH-58, Modipuram Bypass, Meerut-250001 (U.P.), INDIA\n- School Code: 60473 | Affiliation No: 2131045",
    curriculum: "We follow CBSE curriculum with a career-oriented syllabus focused on:\n- Holistic child development\n- Activity-based learning\n- Traditional values with modern approach\n- Development of intellectual, emotional, social, physical, artistic, creative and spiritual potentials"
  };

  for (const [category, keywordList] of Object.entries(keywords)) {
    if (keywordList.some(keyword => lowerMessage.includes(keyword))) {
      return responses[category];
    }
  }

  return "Thank you for your question! I'm here to help you learn more about THE AARYANS - Chariot of Knowledge. You can ask me about:\n- Admissions process\n- School timings\n- Facilities and infrastructure\n- CBSE curriculum\n- Our objectives\n\nFeel free to ask anything, or contact us directly at 9837975353, 8755998955!";
}
