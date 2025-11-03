import { Heart, Users, Star, Globe } from 'lucide-react';
import { Carousel } from './Carousel';

export function Objectives() {
  const objectives = [
    {
      icon: Heart,
      title: 'Love for Learning',
      description: 'To inculcate in our children love for learning.'
    },
    {
      icon: Users,
      title: 'Well-Rounded Personalities',
      description: 'To nurture well rounded personalities who are confident, creative and able to adjust and adopt to any circumstances of environment.'
    },
    {
      icon: Star,
      title: 'Lead by Example',
      description: 'To lead by example and be good role models so that our children imbibe our qualities and take pride in what they do.'
    },
    {
      icon: Globe,
      title: 'Global Citizens',
      description: 'Preparing global citizens committed to humanistic values and democratic traditions with strong secular ethos.'
    }
  ];

  return (
    <section id="objectives" className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Objectives</h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            At THE AARYANS, we are committed to developing compassionate, capable, and confident individuals ready to make a positive impact on the world.
          </p>
        </div>

        <div className="px-12">
          <Carousel
            itemsPerView={{ mobile: 1, tablet: 2, desktop: 2 }}
            autoPlay={true}
            gap="1.5rem"
          >
            {objectives.map((objective, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border-2 border-white/20 hover:bg-white/20 transition-all group h-full"
              >
                <div className="w-14 h-14 bg-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <objective.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{objective.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{objective.description}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
