import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Database, Search, Sparkles, Activity, Dna, Microscope, Pill } from 'lucide-react';
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

          <div className="relative mb-16 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bTAgNDBjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

            <div className="absolute top-10 left-10 opacity-20">
              <Dna className="w-32 h-32 text-white animate-pulse" />
            </div>
            <div className="absolute bottom-10 right-10 opacity-20">
              <Microscope className="w-28 h-28 text-white animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute top-1/2 right-1/4 opacity-15">
              <Pill className="w-24 h-24 text-white animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="absolute bottom-1/3 left-1/4 opacity-15">
              <Activity className="w-20 h-20 text-white animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24 lg:py-32">
              <div className="text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/30 blur-xl rounded-full"></div>
                    <img
                      src="/medexplain_logo.png"
                      alt="MedExplain Logo"
                      className="relative h-24 w-24 sm:h-32 sm:w-32 object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>

                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full mb-6 shadow-lg">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">
                    Powered by FDA, CPIC & PharmGKB
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                  MedExplain
                </h1>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-6 leading-tight drop-shadow-md">
                  Understand How Your Genetics Affect Drug Response and Side Effects
                </h2>

                <p className="text-lg sm:text-xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow">
                  A real-time AI that connects drug and genetic data and insights explaining why
                  side effects happen and how to make treatment safer and more effective.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {user ? (
                    <Link
                      to="/chat"
                      className="group px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center space-x-2"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <Link
                      to="/signup"
                      className="group px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center space-x-2"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  <Link
                    to="/evidence"
                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-white/30 transition-all transform hover:scale-105 border-2 border-white/40"
                  >
                    Browse Evidence
                  </Link>
                </div>

                <p className="mt-8 text-sm text-white/90 font-medium drop-shadow">
                  50 free queries per month • No credit card required
                </p>
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
                  to="/chat"
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
