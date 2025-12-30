import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Database, Search, Sparkles, Activity, Dna, Microscope, Pill, Clock, Users, MessageSquare, TrendingUp, Heart, UserPlus, Stethoscope } from 'lucide-react';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';

export default function Home() {
  const { user } = useAuth();
  return (
    <Layout>
      <div className="min-h-screen bg-background-main overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjViZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bTAgNDBjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">

          <div className="relative mb-16">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

            <div className="absolute top-20 right-16 opacity-10">
              <Dna className="w-64 h-64 text-blue-600" />
            </div>
            <div className="absolute bottom-10 left-16 opacity-10">
              <Microscope className="w-48 h-48 text-teal-600" />
            </div>

            <div className="relative z-10 text-center mb-16 pt-8">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400/30 blur-3xl rounded-full animate-pulse"></div>
                  <img
                    src="/medexplain_logo_updated.png"
                    alt="MedExplain Logo"
                    className="relative h-56 w-56 sm:h-72 sm:w-72 object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-teal-50 backdrop-blur-sm rounded-full mb-6 shadow-lg border border-blue-100">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Powered by FDA, CPIC & PharmGKB
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-6 leading-tight max-w-4xl mx-auto">
                Pharmacogenomics Explained: 
              </h1>

              <p className="text-lg sm:text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
                AI-Driven Insights Into How Your Genetics Affect Medication Response and Side Effects
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-teal-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-teal-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <Link
                  to="/evidence"
                  className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-2 border-gray-200 hover:border-blue-300"
                >
                  Browse Evidence
                </Link>
              </div>

              <p className="mt-8 text-sm text-gray-500 font-medium">
                50 free queries per month • No credit card required
              </p>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary text-center mb-4">
              Who Is MedExplain For?
            </h2>
            <p className="text-lg text-text-secondary text-center mb-16 max-w-3xl mx-auto">
              Choose your path to get medication insights tailored to your needs
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-10 shadow-xl border border-emerald-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="flex flex-col h-full">
                  <div className="flex-shrink-0 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                      For Patients & Caregivers
                    </h3>
                    <p className="text-base text-gray-700 mb-6">
                      Get personalized answers about medication side effects and how your genetics might be affecting your treatment.
                    </p>
                    <ul className="space-y-3 mb-8 text-left">
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">Understand why you experience certain side effects</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">Learn how genetic markers affect drug metabolism</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">Get plain-language explanations for discussions with your doctor</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">Research medications for yourself or a loved one</span>
                      </li>
                    </ul>
                  </div>
                  <Link
                    to="/patient-inquiry"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105"
                  >
                    <span>Start Patient Inquiry</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 md:p-10 shadow-xl border border-blue-100 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="flex flex-col h-full">
                  <div className="flex-shrink-0 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                      <Stethoscope className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                      For Doctors & Clinicians
                    </h3>
                    <p className="text-base text-gray-700 mb-6">
                      Access clinical-level pharmacogenomic insights backed by FDA labels, CPIC guidelines, and PharmGKB data.
                    </p>
                    <ul className="space-y-3 mb-8 text-left">
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">Access comprehensive drug-gene interaction data instantly</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">Review evidence-based dosing recommendations</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">Stay updated with latest pharmacogenomic guidelines</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <span className="text-sm text-gray-700">Make informed prescribing decisions for your patients</span>
                      </li>
                    </ul>
                  </div>
                  <Link
                    to="/clinical-inquiry"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105"
                  >
                    <span>Start Clinical Inquiry</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="group bg-background-card backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Verified Sources
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Curated from FDA labels, CPIC guidelines, and PharmGKB research.
                Every recommendation is backed by peer-reviewed evidence.
              </p>
            </div>

            <div className="group bg-background-card backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Instant Insights
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Enter a drug and gene combination to receive tailored guidance.
                Choose patient or clinician view for appropriate detail levels.
              </p>
            </div>

            <div className="group bg-background-card backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Educational Only
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Designed to inform and educate, not to diagnose or treat.
                Always consult healthcare professionals for medical decisions.
              </p>
            </div>

            <div className="group bg-background-card backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Personalized for You
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Get answers tailored to your specific medications, genetic markers, and health profile.
                No generic information.
              </p>
            </div>

            <div className="group bg-background-card backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Available Anytime
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Access pharmacogenomic insights whenever you need them.
                No appointments necessary.
              </p>
            </div>

            <div className="group bg-background-card backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                For Everyone
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Whether you're a patient, caregiver, or clinician, get information at the right level of detail for you.
              </p>
            </div>
          </div>

          <div className="mt-20 bg-primary rounded-3xl p-1 shadow-2xl">
            <div className="bg-background-card rounded-[22px] p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Ready to explore pharmacogenomics?
              </h2>
              <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                Join healthcare professionals and patients using MedExplain to understand
                how genetics influence medication response.
              </p>
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-primary-light transition-all transform hover:scale-105"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-primary-light transition-all transform hover:scale-105"
                >
                  <span>Create Your Account</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </main>
        </div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
    </Layout>
  );
}
