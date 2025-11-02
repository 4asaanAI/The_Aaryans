import { ClipboardList, FileText, Calendar } from 'lucide-react';

export function Admission() {
  return (
    <section id="admission" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-2 bg-orange-100 text-orange-600 rounded-full font-semibold mb-4">
            Admissions Open 2024-25
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Admission Guidelines</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Join THE AARYANS family and provide your child with quality education in a nurturing environment. Limited seats available!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Step 1</h3>
            <p className="text-slate-600">
              Download and fill the admission form from our website or collect it from the school office
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Step 2</h3>
            <p className="text-slate-600">
              Schedule a campus tour and submit the completed form with required documents
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Step 3</h3>
            <p className="text-slate-600">
              Complete the interaction process and document verification for final admission
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Enroll?</h3>
            <p className="text-lg mb-8 text-white/90">
              Take the first step towards your child's bright future. Contact us today for more information about our admission process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="px-8 py-4 bg-white text-orange-600 rounded-lg font-semibold hover:bg-slate-100 transition-all hover:scale-105 transform"
              >
                Contact for Admission
              </a>
              <a
                href="#registration"
                className="px-8 py-4 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all backdrop-blur-sm border border-white/30"
              >
                Online Registration
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Required Documents</h3>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>Birth Certificate (original and photocopy)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>Transfer Certificate (if applicable)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>Previous academic records</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span>Passport size photographs</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <span>Address proof</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h3>
            <div className="space-y-4 text-slate-600">
              <div>
                <p className="font-semibold text-slate-900 mb-1">For Admission Queries:</p>
                <p>Phone: 9837975353, 8755998955</p>
                <p>Email: principal@theaaryans.com</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Visit Us:</p>
                <p>62 KM Stone, NH-58, Modipuram Bypass</p>
                <p>Meerut- 250001 (U.P.), INDIA</p>
              </div>
              <div className="pt-4">
                <a
                  href="#fee"
                  className="text-orange-600 font-semibold hover:text-orange-700 underline"
                >
                  View Fee Structure 2025-26 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
