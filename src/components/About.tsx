import { Building2, Users, Award, Target } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">About Us</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            THE AARYANS, an institution of the Vedic Educational Foundation, was founded on April 10, 2008, by visionaries Shri Harpal Singh Chaudhary and Chaudhary Kadam Singh. We embrace traditional values while forging ahead on the 'Chariot of Knowledge'.
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
                  THE AARYANS embraces traditional values while forging ahead on the 'Chariot of Knowledge' to face the challenges of the world with courage and conviction.
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
                  The School aims to help the students be the most they can be and develop intellectual, emotional, social, physical, artistic, creative and spiritual potentials while maintaining highest standards of excellence.
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
              <p className="text-sm text-slate-600">Affiliation No: 2131045 | School Code: 60473</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-orange-600" />
                <h4 className="font-bold text-slate-900">Leadership</h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Principal:</strong> Preeti Malhotra
              </p>
              <p className="text-sm text-slate-600">
                "Education is the ability to meet life situations." - Leading with the mission to inculcate compassion and humanitarian spirit in every student.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <h4 className="font-bold mb-2">Campus Highlights</h4>
              <ul className="text-sm space-y-1">
                <li>8-acre peaceful campus</li>
                <li>Co-educational institution</li>
                <li>Founded in 2008</li>
                <li>Meerut, Uttar Pradesh</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Users, title: 'Experienced Staff', desc: 'Trained educators for excellence' },
            { icon: Award, title: 'CBSE Curriculum', desc: 'Career-oriented syllabus' },
            { icon: Building2, title: 'Modern Infrastructure', desc: 'State-of-the-art facilities' },
            { icon: Target, title: 'Holistic Development', desc: 'Activity-based learning' }
          ].map((item, index) => (
            <div key={index} className="text-center p-6 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-orange-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
