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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => {
        const nextIndex = prev + 3;
        return nextIndex >= testimonials.length ? 0 : nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full  backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="bg-orange-500 p-2 rounded">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Primary School</span>
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
      <section className="relative pt-24 pb-12 px-6 min-h-[600px] flex items-center">
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
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why We Are The Best</h2>
            <p className="text-gray-600 mb-12 max-w-2xl">
              We have acquired true excellence in education and built a nurturing community that genuinely cares for your children's development. Our commitment to quality education, experienced faculty, and state-of-the-art facilities make us the preferred choice for discerning parents.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
            <div className="relative">
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

      {/* School Activities & Contact Section */}
      <section className="py-16 px-6" id="activities">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* School Activities */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">School Activities</h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Our comprehensive activity program is designed to develop well-rounded individuals. We believe that learning extends beyond textbooks and encourage students to explore their passions through hands-on experiences.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-orange-500 rounded-2xl p-6 text-center hover:bg-orange-600 transition-all cursor-pointer hover:scale-105 transform group">
                  <FlaskConical className="w-12 h-12 text-white mx-auto mb-3 group-hover:rotate-12 transition-transform" />
                  <p className="text-white font-semibold text-sm mb-2">Science Experiment</p>
                  <p className="text-white/80 text-xs">Hands-on laboratory sessions fostering curiosity and scientific thinking</p>
                </div>
                <div className="bg-orange-500 rounded-2xl p-6 text-center hover:bg-orange-600 transition-all cursor-pointer hover:scale-105 transform group">
                  <Palette className="w-12 h-12 text-white mx-auto mb-3 group-hover:rotate-12 transition-transform" />
                  <p className="text-white font-semibold text-sm mb-2">Art & Drawing</p>
                  <p className="text-white/80 text-xs">Creative expression through various art forms and mediums</p>
                </div>
                <div className="bg-orange-500 rounded-2xl p-6 text-center hover:bg-orange-600 transition-all cursor-pointer hover:scale-105 transform group">
                  <Music className="w-12 h-12 text-white mx-auto mb-3 group-hover:rotate-12 transition-transform" />
                  <p className="text-white font-semibold text-sm mb-2">Music & Singing</p>
                  <p className="text-white/80 text-xs">Musical training including instruments and vocal development</p>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>

                <div className="space-y-3">
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
            </div>

            {/* Have any Questions & Book Admissions */}
            <div className="space-y-8">
              {/* Contact Form */}
              <div className="bg-orange-500 rounded-2xl p-8 hover:shadow-2xl transition-all">
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
                  <input
                    type="text"
                    placeholder="Location/City"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />

                  <div className="space-y-3">
                    <p className="text-white font-semibold">Preferred Time Slot</p>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                      required
                    >
                      <option value="">Select a time slot</option>
                      <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                      <option value="afternoon">Afternoon (12:00 PM - 3:00 PM)</option>
                      <option value="evening">Evening (3:00 PM - 6:00 PM)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white text-orange-500 py-3 rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105 transform"
                  >
                    Submit Inquiry
                  </button>
                </form>
              </div>

              {/* Book Admissions */}
              <div className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all">
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
      <section className="py-16 px-6">
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
      <section className="py-16 px-6" id="teachers">
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
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-2">Let's be social!</h3>
          <p className="text-white/70 mb-6">Follow us on social media for updates, events, and student achievements</p>
          <div className="flex gap-4">
            <a href="#" className="bg-orange-500 p-3 rounded-full hover:bg-orange-600 transition-all hover:scale-110 transform">
              <Facebook className="w-6 h-6 text-white" />
            </a>
            <a href="#" className="bg-orange-500 p-3 rounded-full hover:bg-orange-600 transition-all hover:scale-110 transform">
              <Twitter className="w-6 h-6 text-white" />
            </a>
            <a href="#" className="bg-orange-500 p-3 rounded-full hover:bg-orange-600 transition-all hover:scale-110 transform">
              <Instagram className="w-6 h-6 text-white" />
            </a>
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
                <span className="text-xl font-bold text-white">Primary School</span>
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
