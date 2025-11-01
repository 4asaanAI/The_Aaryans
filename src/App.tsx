import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Play,
  Shield,
  Award,
  BookOpen,
  Users,
  FlaskConical,
  Palette,
  Music,
  Facebook,
  Twitter,
  Instagram,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock
} from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    time: ''
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'The teachers here are exceptional! My daughter has grown so much academically and socially. The individual attention she receives is remarkable.'
    },
    {
      name: 'Michael Chen',
      text: 'Best decision we made for our son\'s education. The facilities are top-notch and the curriculum is perfectly balanced between academics and creativity.'
    },
    {
      name: 'Emma Williams',
      text: 'The care and attention my children receive is outstanding. They love going to school every day, and that says it all! Highly recommend.'
    },
    {
      name: 'David Martinez',
      text: 'Outstanding educational institution! The teachers are passionate, the curriculum is comprehensive, and my children are thriving in this nurturing environment.'
    },
    {
      name: 'Lisa Anderson',
      text: 'We couldn\'t be happier with our choice. The school\'s focus on both academic excellence and character development is truly commendable.'
    },
    {
      name: 'Robert Thompson',
      text: 'The staff goes above and beyond to ensure each child reaches their full potential. The extracurricular programs are exceptional too!'
    }
  ];

  const schoolPlaces = [
    {
      title: 'Modern Playground',
      subtitle: 'Safe and spacious outdoor area with modern play equipment',
      image: 'https://images.pexels.com/photos/1094072/pexels-photo-1094072.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      title: 'School Canteen',
      subtitle: 'Hygienic cafeteria serving nutritious and delicious meals',
      image: 'https://images.pexels.com/photos/1332189/pexels-photo-1332189.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      title: 'Smart Classrooms',
      subtitle: 'Technology-enabled learning spaces with interactive displays',
      image: 'https://images.pexels.com/photos/8471831/pexels-photo-8471831.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      title: 'Science Laboratory',
      subtitle: 'Well-equipped labs for hands-on scientific exploration',
      image: 'https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      title: 'Library & Reading Room',
      subtitle: 'Extensive collection of books fostering a love for reading',
      image: 'https://images.pexels.com/photos/2908984/pexels-photo-2908984.jpeg?auto=compress&cs=tinysrgb&w=1920'
    },
    {
      title: 'Sports Facilities',
      subtitle: 'Indoor and outdoor courts for various sports activities',
      image: 'https://images.pexels.com/photos/1089459/pexels-photo-1089459.jpeg?auto=compress&cs=tinysrgb&w=1920'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => {
        const nextIndex = prev + 3;
        return nextIndex >= testimonials.length ? 0 : nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % schoolPlaces.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [schoolPlaces.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % schoolPlaces.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + schoolPlaces.length) % schoolPlaces.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What is the admission process?",
      answer: "Our admission process begins with filling out an online application form. This is followed by a campus tour where parents and students can experience our facilities firsthand. Students then participate in an age-appropriate assessment to help us understand their learning level. Finally, we conduct a personal interview with parents to discuss our educational philosophy and answer any questions."
    },
    {
      question: "Do you provide transportation?",
      answer: "Yes, we provide comprehensive and safe transportation services covering all major areas of the city. Our buses are equipped with GPS tracking, CCTV cameras, and trained attendants. We ensure timely pickups and drop-offs with multiple routes designed for convenience. Parents receive real-time updates about their child's journey."
    },
    {
      question: "Are there extracurricular activities?",
      answer: "Absolutely! We believe in holistic development and offer a wide range of extracurricular activities including sports (football, basketball, swimming), arts (painting, pottery, drama), music (instrumental and vocal), dance, coding clubs, robotics, debate society, and environmental clubs. Students are encouraged to explore their interests beyond academics."
    },
    {
      question: "What is the student-teacher ratio?",
      answer: "We maintain a low student-teacher ratio of 15:1 to ensure personalized attention for every child. This allows our teachers to understand each student's unique learning style, strengths, and areas for improvement, enabling them to provide tailored support and foster meaningful relationships."
    },
    {
      question: "What are the school timings?",
      answer: "Our regular school hours are from 8:30 AM to 3:00 PM, Monday through Friday. We also offer extended care services from 7:00 AM to 6:00 PM for working parents. The school follows a structured schedule with dedicated time for academics, physical education, lunch, and extracurricular activities."
    },
    {
      question: "What curriculum do you follow?",
      answer: "We follow an internationally recognized curriculum that combines the best practices from various educational systems. Our program emphasizes critical thinking, creativity, and problem-solving skills while maintaining strong foundations in core subjects like Mathematics, Science, Language Arts, and Social Studies. We also integrate technology, arts, and physical education into daily learning."
    },
    {
      question: "How do you ensure child safety?",
      answer: "Child safety is our top priority. Our campus has 24/7 security personnel, CCTV surveillance throughout, controlled access points, and visitor management systems. All staff undergo thorough background checks and regular safety training. We have a certified school nurse on campus, fire safety systems, and regular emergency drills to ensure preparedness."
    },
    {
      question: "Do you offer meals and snacks?",
      answer: "Yes, we provide nutritious, balanced meals and snacks prepared fresh daily in our hygienic kitchen. Our menu is designed by nutritionists to meet growing children's dietary needs. We accommodate special dietary requirements, allergies, and cultural preferences. Parents receive monthly menus in advance."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full backdrop-blur-sm z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0f2943] shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="bg-orange-500 p-2 rounded">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">The Aaryans</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Home</a>
              <a href="#about" className="text-white/90 hover:text-white transition-colors text-sm font-medium">About</a>
              <a href="#activities" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Activities</a>
              <a href="#teachers" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Teachers</a>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-all text-sm font-semibold hover:scale-105 transform">
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-6 min-h-[600px] flex items-center rounded-b-[60px] overflow-hidden bg-[#0f2943]">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/2/29/Exeter_High_School_%28New_Hampshire%29.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2943] via-[#0f2943]/70 to-[#0f2943]/40"></div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="max-w-xl animate-slideUp">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              An Inspiring Primary School for your child
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              A primary school with incredible staff to inspire and excite, to educate, care lovingly and to make that special individual feel confident in their abilities.
            </p>
            <div className="flex gap-4">
              <button className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-all font-semibold hover:scale-105 transform">
                Schedule a tour
              </button>
              <button className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all font-semibold flex items-center gap-2 hover:scale-105 transform">
                <Play className="w-4 h-4 fill-white" />
                Watch Video
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Are The Best Section */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why We Are The Best</h2>
            <p className="text-gray-600 mb-8 max-w-2xl">
              We have acquired true excellence in education and built a nurturing community that genuinely cares for your children's development. Our commitment to quality education, experienced faculty, and state-of-the-art facilities make us the preferred choice for discerning parents.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pb-8 border-b-2 border-gray-200">
              <div className="text-center hover:scale-105 transform transition-all">
                <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Safe Environment</h3>
                <p className="text-sm text-gray-600">
                  24/7 security, CCTV monitoring, and controlled access ensure complete safety for every student on campus.
                </p>
              </div>

              <div className="text-center hover:scale-105 transform transition-all">
                <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Certified Teachers</h3>
                <p className="text-sm text-gray-600">
                  Highly qualified educators with years of experience and specialized training in modern teaching methodologies.
                </p>
              </div>

              <div className="text-center hover:scale-105 transform transition-all">
                <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Quality Education</h3>
                <p className="text-sm text-gray-600">
                  Internationally recognized curriculum focusing on critical thinking, creativity, and comprehensive skill development.
                </p>
              </div>

              <div className="text-center hover:scale-105 transform transition-all">
                <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Extensive Programs</h3>
                <p className="text-sm text-gray-600">
                  Well-rounded education with diverse extracurricular activities, sports, arts, and technology programs.
                </p>
              </div>
            </div>

            {/* Testimonials - Auto Slider */}
            <div className="relative pt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Parents Say</h3>
              <div className="overflow-hidden">
                <div className="grid md:grid-cols-3 gap-6 transition-all duration-500">
                  {testimonials.slice(currentTestimonial, currentTestimonial + 3).map((testimonial, index) => (
                    <div key={currentTestimonial + index} className="bg-[#0f2943] rounded-2xl p-6 text-white hover:scale-105 transform transition-all animate-fadeIn">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold mb-1">{testimonial.name}</h4>
                          <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-orange-500 text-orange-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {testimonial.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 3].map((startIndex) => (
                  <button
                    key={startIndex}
                    onClick={() => setCurrentTestimonial(startIndex)}
                    className={`h-2 rounded-full transition-all ${
                      startIndex === currentTestimonial
                        ? 'w-8 bg-orange-500'
                        : 'w-2 bg-gray-400 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to testimonial group ${startIndex / 3 + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Facilities Slideshow - Full Width */}
      <section className="py-0 bg-[#0f2943]">
        <div className="relative">
          <div className="relative h-[400px] overflow-hidden">
            {schoolPlaces.map((place, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={place.image}
                  alt={place.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white max-w-7xl mx-auto">
                  <h3 className="text-3xl md:text-5xl font-bold mb-2 animate-fadeIn">{place.title}</h3>
                  <p className="text-lg md:text-2xl text-white/90 animate-fadeIn">{place.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {schoolPlaces.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-orange-500'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* School Activities & Contact Section */}
      <section className="py-16 px-6 bg-white" id="activities">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* FAQ and Have Any Questions */}
            <div className="flex flex-col gap-8">
              {/* FAQ Section */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-orange-100 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>

                <div className="space-y-3 flex-1">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-bold text-gray-900 text-sm">{faq.question}</h4>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            openFaq === index ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openFaq === index && (
                        <div className="p-4 pt-0 animate-fadeIn">
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-orange-500 rounded-2xl p-8 shadow-xl border-2 border-orange-600 hover:shadow-2xl transition-all">
                <h3 className="text-3xl font-bold text-white mb-2">Have any Questions?</h3>
                <p className="text-white/90 mb-6 text-sm">Fill out the form below and we'll get back to you within 24 hours</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />

                  <button
                    type="submit"
                    className="w-full bg-white text-orange-500 py-3 rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105 transform"
                  >
                    Submit Inquiry
                  </button>
                </form>
              </div>
            </div>

            {/* School Activities & Book Admissions */}
            <div className="flex flex-col gap-8">
              {/* School Activities */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-orange-100 flex-1 flex flex-col">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">School Activities</h2>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Our comprehensive activity program is designed to develop well-rounded individuals. We believe that learning extends beyond textbooks and encourage students to explore their passions through hands-on experiences.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    {
                      icon: FlaskConical,
                      title: 'Science Experiment',
                      description: 'Our state-of-the-art science laboratory provides students with hands-on experience in conducting experiments and exploring scientific concepts. From basic chemistry to physics demonstrations, students engage in practical learning that brings textbook theories to life. Our experienced science teachers guide students through safe, educational experiments that foster critical thinking, problem-solving skills, and a genuine love for scientific discovery. Students learn to formulate hypotheses, conduct investigations, and analyze results, developing essential skills for future academic success.'
                    },
                    {
                      icon: Palette,
                      title: 'Art & Drawing',
                      description: 'Our comprehensive art program nurtures creativity and self-expression through various artistic mediums including painting, drawing, sculpture, and mixed media. Students explore different techniques, styles, and artistic movements while developing their unique creative voice. Our dedicated art studio is equipped with professional-grade materials and tools, allowing students to experiment freely and create meaningful artwork. Regular exhibitions and art shows provide opportunities for students to showcase their talents and build confidence in their abilities.'
                    },
                    {
                      icon: Music,
                      title: 'Music & Singing',
                      description: 'Our music program offers comprehensive training in vocal techniques, instrument playing, and music theory. Students have access to a wide range of instruments including keyboards, guitars, drums, and traditional instruments. Weekly music classes focus on rhythm, melody, harmony, and musical expression. Students participate in choir performances, individual recitals, and group concerts throughout the year. Our experienced music teachers help students discover their musical talents while building confidence, discipline, and a lifelong appreciation for the arts.'
                    }
                  ].map((activity, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedActivity(index)}
                      className={`rounded-2xl p-6 text-center transition-all cursor-pointer hover:scale-105 transform group ${
                        selectedActivity === index
                          ? 'bg-orange-500 shadow-lg'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      <activity.icon className={`w-12 h-12 mx-auto mb-3 group-hover:rotate-12 transition-transform ${
                        selectedActivity === index ? 'text-white' : 'text-gray-700'
                      }`} />
                      <p className={`font-semibold text-sm ${
                        selectedActivity === index ? 'text-white' : 'text-gray-900'
                      }`}>{activity.title}</p>
                    </div>
                  ))}
                </div>

                {/* Activity Description */}
                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-100 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {[
                      { icon: FlaskConical, title: 'Science Experiment' },
                      { icon: Palette, title: 'Art & Drawing' },
                      { icon: Music, title: 'Music & Singing' }
                    ][selectedActivity].title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {[
                      'Our state-of-the-art science laboratory provides students with hands-on experience in conducting experiments and exploring scientific concepts. From basic chemistry to physics demonstrations, students engage in practical learning that brings textbook theories to life. Our experienced science teachers guide students through safe, educational experiments that foster critical thinking, problem-solving skills, and a genuine love for scientific discovery. Students learn to formulate hypotheses, conduct investigations, and analyze results, developing essential skills for future academic success.',
                      'Our comprehensive art program nurtures creativity and self-expression through various artistic mediums including painting, drawing, sculpture, and mixed media. Students explore different techniques, styles, and artistic movements while developing their unique creative voice. Our dedicated art studio is equipped with professional-grade materials and tools, allowing students to experiment freely and create meaningful artwork. Regular exhibitions and art shows provide opportunities for students to showcase their talents and build confidence in their abilities.',
                      'Our music program offers comprehensive training in vocal techniques, instrument playing, and music theory. Students have access to a wide range of instruments including keyboards, guitars, drums, and traditional instruments. Weekly music classes focus on rhythm, melody, harmony, and musical expression. Students participate in choir performances, individual recitals, and group concerts throughout the year. Our experienced music teachers help students discover their musical talents while building confidence, discipline, and a lifelong appreciation for the arts.'
                    ][selectedActivity]}
                  </p>
                </div>
              </div>

              {/* Book Admissions */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-orange-100 hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Book Admissions</h3>
                <p className="text-orange-500 font-bold text-xl mb-2">Now Open!</p>
                <p className="text-gray-600 text-sm mb-6">Limited seats available for the upcoming academic year. Secure your child's future today.</p>

                <div className="space-y-4">
                  <button className="w-full bg-orange-500 text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 hover:scale-105 transform">
                    <GraduationCap className="w-5 h-5" />
                    Book A Tour Now
                  </button>
                  <div className="text-center">
                    <span className="text-gray-500 font-semibold">OR</span>
                  </div>
                  <button className="w-full border-2 border-orange-500 text-orange-500 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all hover:scale-105 transform">
                    Download Admission Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Location */}
      <section className="py-8 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Visit Our Campus</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Address</h3>
                    <p className="text-gray-600">123 Education Boulevard, Green Valley District, Metropolitan City, 12345</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">+1 (555) 765-4321</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Mail className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600">info@primaryschool.edu</p>
                    <p className="text-gray-600">admissions@primaryschool.edu</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Office Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="h-[400px] rounded-2xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878459253!3d40.74076794379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sGoogle!5e0!3m2!1sen!2sus!4v1635959873000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="School Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 bg-[#0f2943]" id="teachers">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Meet Our Expert Faculty</h2>
          <p className="text-white/70 mb-8 max-w-2xl">
            Our passionate and dedicated team of educators brings years of experience and a genuine love for teaching. Each teacher is committed to nurturing young minds and creating a positive learning environment.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Charlotte M.', role: 'Art Teacher', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400', exp: '8 years experience' },
              { name: 'James P.', role: 'Science Teacher', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400', exp: '12 years experience' },
              { name: 'Sarah K.', role: 'Music Teacher', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400', exp: '10 years experience' },
              { name: 'Michael R.', role: 'Sports Teacher', image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400', exp: '15 years experience' }
            ].map((teacher, index) => (
              <div key={index} className="text-center hover:scale-105 transform transition-all">
                <div className="w-32 h-32 rounded-full bg-orange-500 mx-auto mb-4 overflow-hidden border-4 border-white/20">
                  <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-white font-bold mb-1">{teacher.name}</h4>
                <p className="text-orange-400 text-sm font-semibold mb-1">{teacher.role}</p>
                <p className="text-white/60 text-xs">{teacher.exp}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-12 px-6 bg-[#0f2943]">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent blur-3xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-[#1a3a5a] to-[#0f2943] rounded-3xl p-10 shadow-2xl border-2 border-orange-500/30" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(251, 146, 60, 0.1), inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)' }}>
              <h3 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Let's be social!</h3>
              <p className="text-white/80 mb-8 text-lg">Follow us on social media for updates, events, and student achievements</p>
              <div className="flex gap-6">
                <a href="#" className="relative group">
                  <div className="absolute inset-0 bg-orange-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-2xl transition-all group-hover:scale-110 group-hover:shadow-2xl border-2 border-orange-400/50" style={{ boxShadow: '0 10px 30px rgba(251, 146, 60, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}>
                    <Facebook className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                </a>
                <a href="#" className="relative group">
                  <div className="absolute inset-0 bg-orange-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-2xl transition-all group-hover:scale-110 group-hover:shadow-2xl border-2 border-orange-400/50" style={{ boxShadow: '0 10px 30px rgba(251, 146, 60, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}>
                    <Twitter className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                </a>
                <a href="#" className="relative group">
                  <div className="absolute inset-0 bg-orange-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-2xl transition-all group-hover:scale-110 group-hover:shadow-2xl border-2 border-orange-400/50" style={{ boxShadow: '0 10px 30px rgba(251, 146, 60, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}>
                    <Instagram className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a1f33] py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-500 p-2 rounded">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">The Aaryans</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Inspiring young minds to achieve excellence through quality education, innovation, and care.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">About Us</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Our Mission</a></li>
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Our Vision</a></li>
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Leadership Team</a></li>
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Accreditation</a></li>
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Admissions</a></li>
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Academic Calendar</a></li>
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Events</a></li>
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">News & Updates</a></li>
                <li><a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Parent Portal</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>123 Education Blvd, Green Valley</span>
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>info@primaryschool.edu</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/60 text-sm">&copy; 2025 Primary School. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
