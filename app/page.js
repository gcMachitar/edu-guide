export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full py-4 px-4 md:py-6 md:px-8 flex justify-between items-center border-b">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-700 shrink-0">eduguide.ph</h1>
        <div className="flex items-center gap-2 md:gap-6 ml-4">
          <a href="/login" className="text-sm md:text-base text-purple-600 hover:underline hover:text-purple-700 transition-all duration-200 transform hover:scale-105 whitespace-nowrap">Sign in</a>
          <a href="/register" className="bg-purple-600 text-white px-3 py-1.5 md:px-6 md:py-2 rounded-lg text-sm md:text-base hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-md whitespace-nowrap">
            Register
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12 animate-slide-in-up bg-gradient-to-b from-purple-50 to-white">
        <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
          Empowering Rural Students in Mindanao
        </h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl leading-relaxed mb-12">
       EduGuide PH provides a free AI chatbot that offers personalized study help, clear explanations, quizzes, study plans, career suggestions, and offline functionality. Available in English, Cebuano, and Tagalog, the app is tailored to the needs of students in areas with spotty data and low-end smartphones, ensuring that no one is left behind in their educational journey.
        </p>

        {/* Mobile preview mockup */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden max-w-sm w-full hover:scale-105 transition-transform duration-300">
          <div className="bg-gradient-to-b from-purple-100 to-white p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-purple-300 flex items-center justify-center text-2xl animate-pulse">📚</div>
            </div>
            <h3 className="text-2xl font-bold text-purple-700 mb-2">EduGuide PH</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Your trusted partner in academic and career success, built for the unique needs of rural Mindanao students.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <a href="/register" className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 active:scale-95">
            Get Started
          </a>
          <a href="/prompt" className="border border-purple-600 text-purple-600 px-8 py-4 rounded-lg hover:bg-purple-50 hover:border-purple-700 transition-all duration-300 font-semibold text-lg transform hover:scale-105 hover:-translate-y-1 active:scale-95">
            Try Demo
          </a>
        </div>
      </main>

      <footer className="w-full py-8 px-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            © 2026 edugude.ph. Empowering students with AI-powered learning.
          </p>
          <div className="mt-4 space-x-6">
            <a href="/login" className="text-purple-600 hover:underline text-sm">Sign In</a>
            <a href="/register" className="text-purple-600 hover:underline text-sm">Register</a>
            <a href="/prompt" className="text-purple-600 hover:underline text-sm">Try Prompt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}