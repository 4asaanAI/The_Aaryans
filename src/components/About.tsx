import { Building2, Users, Award, Target } from 'lucide-react';
import { Carousel } from './Carousel';

export function About() {
  const highlights = [
    { icon: Users, title: 'Experienced Staff', desc: 'Trained educators for excellence' },
    { icon: Award, title: 'CBSE Curriculum', desc: 'Career-oriented syllabus' },
    { icon: Building2, title: 'Modern Infrastructure', desc: 'State-of-the-art facilities' },
    { icon: Target, title: 'Holistic Development', desc: 'Activity-based learning' }
  ];

  return (
    <section id="about" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">About Us</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            THE AARYANS, an institution of the Vedic Educational Trust, was founded on April 13, 2015, by visionaries Ch. Hatpal Singh & Sh. Anil Kumar Singh. Situated on a peaceful, verdant campus, we embrace traditional values while forging ahead on the 'Chariot of Knowledge'.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
                <p className="text-slate-600 leading-relaxed">
                  Good Education is a journey, not a destination. We embrace traditional values while forging ahead on the 'Chariot of Knowledge' to face the challenges of the world with courage and conviction.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed">
                  We care for our values and belief and aim for a perfect balance of complementary factors: ancient and modern, traditional and innovative. We help students develop their intellectual, emotional, social, physical, and spiritual potentials.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-6 h-6 text-orange-600" />
                <h4 className="font-bold text-slate-900">CBSE Affiliated</h4>
              </div>
              <p className="text-sm text-slate-600">CBSE Affiliated Co-educational Institution</p>
            </div>

            <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h4 className="font-bold text-slate-900">Leadership</h4>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Founders:</strong> Ch. Hatpal Singh & Sh. Anil Kumar Singh
                </p>
                <p className="text-xs text-slate-500">
                  Visionaries committed to providing quality education with traditional values.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <h4 className="font-bold mb-2">Campus Highlights</h4>
              <ul className="text-sm space-y-1">
                <li>8-acre peaceful campus</li>
                <li>Co-educational institution</li>
                <li>Founded in 2015</li>
                <li>Amroha, Uttar Pradesh</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="px-12">
          <Carousel
            itemsPerView={{ mobile: 1, tablet: 2, desktop: 4 }}
            autoPlay={true}
            gap="1.5rem"
          >
            {highlights.map((item, index) => (
              <div key={index} className="text-center p-6 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all h-full">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-orange-600" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
