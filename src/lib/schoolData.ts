import { supabase } from './supabase';

export interface SchoolDataItem {
  id?: string;
  category: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export async function populateSchoolData() {
  const { data: existingData } = await supabase
    .from('school_data')
    .select('id')
    .limit(1);

  if (existingData && existingData.length > 0) {
    return { success: true, alreadyPopulated: true };
  }

  const schoolData: Omit<SchoolDataItem, 'id'>[] = [
    {
      category: 'basic_info',
      title: 'School Name',
      content: 'THE AARYANS',
      metadata: { type: 'name', tagline: 'Chariot of Knowledge' }
    },
    {
      category: 'basic_info',
      title: 'School Description',
      content: 'THE AARYANS, an institution of the Vedic Educational Foundation, embraces traditional values while forging ahead on the "Chariot of Knowledge" to face the challenges of the world with courage and conviction. Founded on April 10, 2008, by visionaries Shri Harpal Singh Chaudhary and Chaudhary Kadam Singh, spread across 8 acres.',
      metadata: { type: 'description', founded: '2008', campus: '8 acres', affiliation: 'CBSE' }
    },
    {
      category: 'basic_info',
      title: 'Vision',
      content: 'THE AARYANS embraces traditional values while forging ahead on the "Chariot of Knowledge" to face the challenges of the world with courage and conviction.',
      metadata: { type: 'vision' }
    },
    {
      category: 'basic_info',
      title: 'Mission',
      content: 'The School aims to help the students be the most they can be and develop intellectual, emotional, social, physical, artistic, creative and spiritual potentials while maintaining highest standards of excellence. We inculcate in them compassion and humanitarian spirit.',
      metadata: { type: 'mission' }
    },
    {
      category: 'features',
      title: 'Experienced Staff',
      content: 'Trained and experienced educators dedicated to academic excellence and student development.',
      metadata: { icon: 'users' }
    },
    {
      category: 'features',
      title: 'CBSE Affiliation',
      content: 'Affiliated with CBSE, New Delhi, following a career-oriented syllabus for comprehensive education.',
      metadata: { icon: 'book' }
    },
    {
      category: 'features',
      title: 'Holistic Development',
      content: 'Activity-oriented education focusing on personality development, communication skills, and social growth.',
      metadata: { icon: 'award' }
    },
    {
      category: 'features',
      title: 'Sports Excellence',
      content: 'Comprehensive sports and games facilities promoting physical fitness and competitive spirit.',
      metadata: { icon: 'trophy' }
    },
    {
      category: 'facilities',
      title: 'Sports and Games',
      content: 'Comprehensive sports facilities with dedicated areas for various games and physical education activities.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: 'Library and Study Room',
      content: 'Well-stocked library with extensive collection of books and dedicated study areas for focused learning.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: 'Seminar and Workshop Spaces',
      content: 'Modern facilities for conducting seminars, workshops, and interactive learning sessions.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: 'Educational Excursions',
      content: 'Regular educational trips and excursions to enhance practical knowledge and real-world learning.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: 'Transport Routes',
      content: 'Safe and convenient transportation services covering multiple routes across the region.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: '8-Acre Campus',
      content: 'Spacious, peaceful campus spread across 8 acres providing ample space for learning and recreation.',
      metadata: {}
    },
    {
      category: 'objectives',
      title: 'Love for Learning',
      content: 'To inculcate in our children love for learning.',
      metadata: {}
    },
    {
      category: 'objectives',
      title: 'Well-Rounded Personalities',
      content: 'To nurture well rounded personalities who are confident, creative and able to adjust and adopt to any circumstances of environment.',
      metadata: {}
    },
    {
      category: 'objectives',
      title: 'Lead by Example',
      content: 'To lead by example and be good role models so that our children imbibe our qualities and take pride in what they do.',
      metadata: {}
    },
    {
      category: 'objectives',
      title: 'Global Citizens',
      content: 'Preparing global citizens committed to humanistic values and democratic traditions with strong secular ethos.',
      metadata: {}
    },
    {
      category: 'activities',
      title: 'Science Experiments',
      content: 'Our state-of-the-art science laboratory provides students with hands-on experience in conducting experiments and exploring scientific concepts. From basic chemistry to physics demonstrations, students engage in practical learning that brings textbook theories to life.',
      metadata: {}
    },
    {
      category: 'activities',
      title: 'Art & Drawing',
      content: 'Our comprehensive art program nurtures creativity and self-expression through various artistic mediums including painting, drawing, sculpture, and mixed media. Students explore different techniques, styles, and artistic movements while developing their unique creative voice.',
      metadata: {}
    },
    {
      category: 'activities',
      title: 'Music & Singing',
      content: 'Our music program offers comprehensive training in vocal techniques, instrument playing, and music theory. Students have access to keyboards, guitars, drums, and traditional instruments. Weekly music classes focus on rhythm, melody, harmony, and musical expression.',
      metadata: {}
    },
    {
      category: 'teachers',
      title: 'Charlotte M.',
      content: 'Art Teacher with 8 years of experience in nurturing creativity and artistic expression.',
      metadata: { role: 'Art Teacher', experience: '8 years' }
    },
    {
      category: 'teachers',
      title: 'James P.',
      content: 'Science Teacher with 12 years of experience in hands-on scientific education.',
      metadata: { role: 'Science Teacher', experience: '12 years' }
    },
    {
      category: 'teachers',
      title: 'Sarah K.',
      content: 'Music Teacher with 10 years of experience in music education and performance.',
      metadata: { role: 'Music Teacher', experience: '10 years' }
    },
    {
      category: 'teachers',
      title: 'Michael R.',
      content: 'Sports Teacher with 15 years of experience in physical education and athletics.',
      metadata: { role: 'Sports Teacher', experience: '15 years' }
    },
    {
      category: 'faq',
      title: 'What is the admission process?',
      content: 'Our admission process begins with filling out an online application form. This is followed by a campus tour where parents and students can experience our facilities firsthand. Students then participate in an age-appropriate assessment to help us understand their learning level. Finally, we conduct a personal interview with parents to discuss our educational philosophy and answer any questions.',
      metadata: {}
    },
    {
      category: 'faq',
      title: 'Do you provide transportation?',
      content: 'Yes, we provide comprehensive and safe transportation services covering all major areas of the city. Our buses are equipped with GPS tracking, CCTV cameras, and trained attendants. We ensure timely pickups and drop-offs with multiple routes designed for convenience. Parents receive real-time updates about their child\'s journey.',
      metadata: {}
    },
    {
      category: 'faq',
      title: 'Are there extracurricular activities?',
      content: 'Absolutely! We believe in holistic development and offer a wide range of extracurricular activities including sports (football, basketball, swimming), arts (painting, pottery, drama), music (instrumental and vocal), dance, coding clubs, robotics, debate society, and environmental clubs. Students are encouraged to explore their interests beyond academics.',
      metadata: {}
    },
    {
      category: 'faq',
      title: 'What is the student-teacher ratio?',
      content: 'We maintain a low student-teacher ratio of 15:1 to ensure personalized attention for every child. This allows our teachers to understand each student\'s unique learning style, strengths, and areas for improvement, enabling them to provide tailored support and foster meaningful relationships.',
      metadata: {}
    },
    {
      category: 'faq',
      title: 'What are the school timings?',
      content: 'Our regular school hours are from 8:30 AM to 3:00 PM, Monday through Friday. We also offer extended care services from 7:00 AM to 6:00 PM for working parents. The school follows a structured schedule with dedicated time for academics, physical education, lunch, and extracurricular activities.',
      metadata: {}
    },
    {
      category: 'faq',
      title: 'What curriculum do you follow?',
      content: 'We follow an internationally recognized curriculum that combines the best practices from various educational systems. Our program emphasizes critical thinking, creativity, and problem-solving skills while maintaining strong foundations in core subjects like Mathematics, Science, Language Arts, and Social Studies. We also integrate technology, arts, and physical education into daily learning.',
      metadata: {}
    },
    {
      category: 'faq',
      title: 'How do you ensure child safety?',
      content: 'Child safety is our top priority. Our campus has 24/7 security personnel, CCTV surveillance throughout, controlled access points, and visitor management systems. All staff undergo thorough background checks and regular safety training. We have a certified school nurse on campus, fire safety systems, and regular emergency drills to ensure preparedness.',
      metadata: {}
    },
    {
      category: 'faq',
      title: 'Do you offer meals and snacks?',
      content: 'Yes, we provide nutritious, balanced meals and snacks prepared fresh daily in our hygienic kitchen. Our menu is designed by nutritionists to meet growing children\'s dietary needs. We accommodate special dietary requirements, allergies, and cultural preferences. Parents receive monthly menus in advance.',
      metadata: {}
    },
    {
      category: 'contact',
      title: 'Address',
      content: '62 KM Stone, NH-58, Modipuram Bypass, Meerut- 250001 (U.P.), INDIA',
      metadata: { type: 'address' }
    },
    {
      category: 'contact',
      title: 'Phone',
      content: '9837975353, 8755998955',
      metadata: { type: 'phone' }
    },
    {
      category: 'contact',
      title: 'Email',
      content: 'principal@theaaryans.com',
      metadata: { type: 'email' }
    },
    {
      category: 'contact',
      title: 'School Code',
      content: '60473 | Affiliation No.: 2131045',
      metadata: { type: 'affiliation' }
    },
    {
      category: 'admissions',
      title: 'Admissions Status',
      content: 'Admissions Open 2024-25! Join us to provide your child with quality education in a nurturing environment.',
      metadata: {}
    },
    {
      category: 'leadership',
      title: 'Principal',
      content: 'Preeti Malhotra - Leading with vision to provide an ideal learning atmosphere for all students.',
      metadata: { role: 'Principal' }
    },
    {
      category: 'leadership',
      title: 'Founders',
      content: 'Shri Harpal Singh Chaudhary and Chaudhary Kadam Singh - Visionaries behind THE AARYANS, founded on April 10, 2008.',
      metadata: { role: 'Founders' }
    }
  ];

  const { error } = await supabase
    .from('school_data')
    .insert(schoolData);

  if (error) {
    console.error('Error populating school data:', error);
    return { success: false, error };
  }

  return { success: true };
}

export async function getSchoolData() {
  const { data, error } = await supabase
    .from('school_data')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching school data:', error);
    throw error;
  }

  return data || [];
}
