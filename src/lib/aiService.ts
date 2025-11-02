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
        response: "I apologize, but I'm having trouble processing your question right now. Please try again or contact us directly at +1 (555) 123-4567 or info@primaryschool.edu.",
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

  const systemPrompt = `You are a helpful assistant for The Aaryans Primary School. Your role is to answer questions about the school based on the following information:

${context}

Instructions:
- Answer questions clearly and concisely based only on the information provided above
- If asked about something not covered in the information, politely say you don't have that specific information and suggest contacting the school directly at +1 (555) 123-4567 or info@primaryschool.edu
- Be friendly, helpful, and professional
- Keep responses focused and not too long (2-4 sentences is ideal)
- If asked about admissions, encourage them to book a tour or contact the school
- Use a warm, welcoming tone appropriate for parents and families`;

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
