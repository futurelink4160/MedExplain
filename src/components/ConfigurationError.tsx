import { AlertCircle } from 'lucide-react';

export default function ConfigurationError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Required</h2>
            <p className="text-gray-600">
              The application is missing required environment variables.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-2">
                Required Environment Variables:
              </p>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start">
                  <span className="font-mono bg-amber-100 px-2 py-0.5 rounded text-xs mr-2 mt-0.5">
                    VITE_SUPABASE_URL
                  </span>
                  <span>Your Supabase project URL</span>
                </li>
                <li className="flex items-start">
                  <span className="font-mono bg-amber-100 px-2 py-0.5 rounded text-xs mr-2 mt-0.5">
                    VITE_SUPABASE_ANON_KEY
                  </span>
                  <span>Your Supabase anonymous key</span>
                </li>
                <li className="flex items-start">
                  <span className="font-mono bg-amber-100 px-2 py-0.5 rounded text-xs mr-2 mt-0.5">
                    VITE_N8N_WEBHOOK_URL
                  </span>
                  <span>Your n8n webhook URL</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-amber-200 pt-4">
              <p className="text-sm font-semibold text-amber-900 mb-2">
                For Bolt Deployment:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
                <li>Go to your Bolt project settings</li>
                <li>Find the Environment Variables section</li>
                <li>Add all three required variables listed above</li>
                <li>Redeploy the application</li>
              </ol>
            </div>

            <div className="border-t border-amber-200 pt-4">
              <p className="text-sm font-semibold text-amber-900 mb-2">
                For Local Development:
              </p>
              <p className="text-sm text-amber-800">
                Copy <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">.env.example</code> to{' '}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">.env</code> and fill in your values.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Check the <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">SETUP.md</code> file for detailed instructions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
