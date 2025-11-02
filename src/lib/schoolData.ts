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
      content: 'The Aaryans',
      metadata: { type: 'name' }
    },
    {
      category: 'basic_info',
      title: 'School Description',
      content: 'An Inspiring Primary School for your child. A primary school with incredible staff to inspire and excite, to educate, care lovingly and to make that special individual feel confident in their abilities.',
      metadata: { type: 'description' }
    },
    {
      category: 'features',
      title: 'Safe Environment',
      content: '24/7 security, CCTV monitoring, and controlled access ensure complete safety for every student on campus.',
      metadata: { icon: 'shield' }
    },
    {
      category: 'features',
      title: 'Certified Teachers',
      content: 'Highly qualified educators with years of experience and specialized training in modern teaching methodologies.',
      metadata: { icon: 'users' }
    },
    {
      category: 'features',
      title: 'Quality Education',
      content: 'Internationally recognized curriculum focusing on critical thinking, creativity, and comprehensive skill development.',
      metadata: { icon: 'book' }
    },
    {
      category: 'features',
      title: 'Extensive Programs',
      content: 'Well-rounded education with diverse extracurricular activities, sports, arts, and technology programs.',
      metadata: { icon: 'award' }
    },
    {
      category: 'facilities',
      title: 'Modern Playground',
      content: 'Safe and spacious outdoor area with modern play equipment for physical activity and recreation.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: 'School Canteen',
      content: 'Hygienic cafeteria serving nutritious and delicious meals prepared fresh daily by nutritionists.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: 'Smart Classrooms',
      content: 'Technology-enabled learning spaces with interactive displays for modern education.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: 'Science Laboratory',
      content: 'Well-equipped labs for hands-on scientific exploration and experiments.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: 'Library & Reading Room',
      content: 'Extensive collection of books fostering a love for reading and knowledge.',
      metadata: {}
    },
    {
      category: 'facilities',
      title: 'Sports Facilities',
      content: 'Indoor and outdoor courts for various sports activities including football, basketball, and swimming.',
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
      content: '123 Education Boulevard, Green Valley District, Metropolitan City, 12345',
      metadata: { type: 'address' }
    },
    {
      category: 'contact',
      title: 'Phone',
      content: '+1 (555) 123-4567 or +1 (555) 765-4321',
      metadata: { type: 'phone' }
    },
    {
      category: 'contact',
      title: 'Email',
      content: 'info@primaryschool.edu or admissions@primaryschool.edu',
      metadata: { type: 'email' }
    },
    {
      category: 'contact',
      title: 'Office Hours',
      content: 'Monday - Friday: 8:00 AM - 5:00 PM, Saturday: 9:00 AM - 1:00 PM',
      metadata: { type: 'hours' }
    },
    {
      category: 'admissions',
      title: 'Admissions Status',
      content: 'Now Open! Limited seats available for the upcoming academic year. Secure your child\'s future today.',
      metadata: {}
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
