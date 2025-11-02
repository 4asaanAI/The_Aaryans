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
    return {
      response: "I apologize, but I'm having trouble processing your question right now. Please try again or contact us directly at +1 (555) 123-4567 or info@primaryschool.edu.",
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
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
  const HF_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';

  const prompt = `${context}\n\nUser Question: ${userMessage}\n\nAssistant Response:`;

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        return getFallbackResponse(userMessage);
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      return cleanResponse(data[0].generated_text);
    }

    return getFallbackResponse(userMessage);
  } catch (error) {
    console.error('Hugging Face API error:', error);
    return getFallbackResponse(userMessage);
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

function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('admission') || lowerMessage.includes('enroll') || lowerMessage.includes('apply')) {
    return "Our admissions are now open with limited seats available! The admission process includes an online application, campus tour, student assessment, and parent interview. You can book a tour or download the admission form from our website. For more details, contact us at +1 (555) 123-4567 or admissions@primaryschool.edu.";
  }

  if (lowerMessage.includes('timing') || lowerMessage.includes('hours') || lowerMessage.includes('schedule')) {
    return "Our regular school hours are 8:30 AM to 3:00 PM, Monday through Friday. We also offer extended care from 7:00 AM to 6:00 PM for working parents. Office hours are Monday-Friday: 8:00 AM - 5:00 PM, and Saturday: 9:00 AM - 1:00 PM.";
  }

  if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('tuition') || lowerMessage.includes('price')) {
    return "For detailed information about fees and tuition, please contact our admissions office at +1 (555) 123-4567 or email admissions@primaryschool.edu. They'll be happy to discuss our fee structure and any available payment plans.";
  }

  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('address')) {
    return "You can reach us at:\n📍 123 Education Boulevard, Green Valley District, Metropolitan City, 12345\n📞 +1 (555) 123-4567 or +1 (555) 765-4321\n✉️ info@primaryschool.edu or admissions@primaryschool.edu\nOffice hours: Mon-Fri 8:00 AM - 5:00 PM, Sat 9:00 AM - 1:00 PM";
  }

  if (lowerMessage.includes('transport') || lowerMessage.includes('bus')) {
    return "Yes! We provide safe transportation covering all major city areas. Our buses have GPS tracking, CCTV cameras, and trained attendants. Parents receive real-time updates about their child's journey.";
  }

  if (lowerMessage.includes('teacher') || lowerMessage.includes('faculty') || lowerMessage.includes('staff')) {
    return "We have highly qualified and experienced teachers including Charlotte M. (Art, 8 years), James P. (Science, 12 years), Sarah K. (Music, 10 years), and Michael R. (Sports, 15 years). Our student-teacher ratio is 15:1 for personalized attention.";
  }

  if (lowerMessage.includes('facilit') || lowerMessage.includes('infrastructure')) {
    return "Our facilities include modern playgrounds, smart classrooms with interactive displays, well-equipped science labs, an extensive library, hygienic canteen, and sports facilities for various activities. All areas have 24/7 security and CCTV monitoring.";
  }

  if (lowerMessage.includes('activit') || lowerMessage.includes('extracurricular') || lowerMessage.includes('sports') || lowerMessage.includes('art') || lowerMessage.includes('music')) {
    return "We offer diverse activities including sports (football, basketball, swimming), arts (painting, pottery, drama), music (instruments and vocals), dance, coding clubs, robotics, and debate society. We believe in holistic development beyond academics!";
  }

  if (lowerMessage.includes('curriculum') || lowerMessage.includes('education') || lowerMessage.includes('syllabus')) {
    return "We follow an internationally recognized curriculum emphasizing critical thinking, creativity, and problem-solving. We maintain strong foundations in Mathematics, Science, Language Arts, and Social Studies, integrated with technology, arts, and physical education.";
  }

  if (lowerMessage.includes('safety') || lowerMessage.includes('security') || lowerMessage.includes('safe')) {
    return "Child safety is our top priority! We have 24/7 security personnel, CCTV surveillance, controlled access points, visitor management, and a certified school nurse on campus. All staff undergo background checks and regular safety training.";
  }

  if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('lunch') || lowerMessage.includes('canteen')) {
    return "Yes! We provide nutritious meals and snacks prepared fresh daily by nutritionists in our hygienic kitchen. We accommodate dietary requirements, allergies, and cultural preferences. Parents receive monthly menus in advance.";
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! Welcome to The Aaryans Primary School. I'm here to help answer your questions about our school, admissions, facilities, programs, and more. How can I assist you today?";
  }

  if (lowerMessage.includes('thank')) {
    return "You're welcome! If you have any more questions about The Aaryans Primary School, feel free to ask. You can also contact us directly at +1 (555) 123-4567 or visit our campus!";
  }

  return "Thank you for your question! I'd be happy to help you learn more about The Aaryans Primary School. Could you please ask about our admissions, facilities, teachers, activities, timings, or any other specific aspect? You can also reach us directly at +1 (555) 123-4567 or info@primaryschool.edu.";
}
