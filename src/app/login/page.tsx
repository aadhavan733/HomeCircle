import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string, mode?: string }>
}) {
  const params = await searchParams
  const isSignUp = params?.mode === 'signup'

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 z-50 fixed inset-0">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex items-center gap-3">
          <img src="/logo_icon.png" alt="Logo" className="h-12 w-auto object-contain" />
          <h2 className="text-center text-4xl font-extrabold text-blue-600 tracking-tight">
            HomeCircle
          </h2>
        </div>
        <p className="mt-2 text-center text-sm text-gray-600">
          Know your family&apos;s money. Plan your month. Save together.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {params?.message && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium">
                {params.message}
              </div>
            )}

            <div>
              {isSignUp ? (
                <button
                  formAction={signup}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Account
                </button>
              ) : (
                <button
                  formAction={login}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </button>
              )}
            </div>
            
            <div className="text-center mt-4">
              {isSignUp ? (
                <a href="/login" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  Already have an account? Sign in
                </a>
              ) : (
                <a href="/login?mode=signup" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  Don&apos;t have an account? Sign up
                </a>
              )}
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              {/* Note: Google Login requires additional client-side code, we placeholder it here for MVP scope */}
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
