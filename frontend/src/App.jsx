import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import RegistrationForm from './components/RegistrationForm'
import RegistrationsTable from './components/RegistrationsTable'
import FeedbackForm from './components/FeedbackForm'
import FeedbacksTable from './components/FeedbacksTable'
import SurveyForm from './components/SurveyForm'
import SurveysTable from './components/SurveysTable'
import Admin from './components/Admin'

function Navigation() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const handleDownloadProgram = () => {
    // Open PDF in new browser tab - browser will display it directly
    const pdfUrl = 'https://register.pngdhl.com/uploads/ProgramDetails.pdf';
    window.open(pdfUrl, '_blank');
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-md mb-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="hidden md:block text-xl md:text-2xl font-bold text-[#0D6731]">
            PNG Forestry Forum
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={handleDownloadProgram}
              className="bg-[#0D6731] text-white px-4 xl:px-6 py-2 rounded-lg font-semibold hover:bg-[#0a5225] transition-colors shadow-md flex items-center gap-2 text-sm xl:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xl:h-5 xl:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="hidden xl:inline">Download Program</span>
              <span className="xl:hidden">Download</span>
            </button>
            <Link
              to="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#0D6731] text-white px-4 xl:px-6 py-2 rounded-lg font-semibold hover:bg-[#0a5225] transition-colors shadow-md flex items-center gap-2 text-sm xl:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xl:h-5 xl:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden xl:inline">Ask a question?</span>
              <span className="xl:hidden">Ask?</span>
            </Link>
            <Link
              to="/survey"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#0D6731] text-white px-4 xl:px-6 py-2 rounded-lg font-semibold hover:bg-[#0a5225] transition-colors shadow-md flex items-center gap-2 text-sm xl:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xl:h-5 xl:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span className="hidden xl:inline">Survey</span>
              <span className="xl:hidden">Survey</span>
            </Link>
            <div className="flex space-x-2 xl:space-x-4">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 xl:px-4 py-2 rounded-lg transition text-sm xl:text-base ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-[#0D6731] text-white'
                    : 'text-gray-600 hover:bg-[#0D6731]/10'
                }`}
              >
                Admin
              </Link>
            </div>
          </div>

          {/* Mobile: Download Button + Ask Question Button + Hamburger Menu */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={handleDownloadProgram}
              className="bg-[#0D6731] text-white px-2 sm:px-3 py-2 rounded-lg font-semibold hover:bg-[#0a5225] transition-colors shadow-md text-xs sm:text-sm flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="hidden sm:inline">Download</span>
            </button>
            <Link
              to="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#0D6731] text-white px-2 sm:px-3 py-2 rounded-lg font-semibold hover:bg-[#0a5225] transition-colors shadow-md text-xs sm:text-sm flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">Ask?</span>
            </Link>
            <Link
              to="/survey"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#0D6731] text-white px-2 sm:px-3 py-2 rounded-lg font-semibold hover:bg-[#0a5225] transition-colors shadow-md text-xs sm:text-sm flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span className="hidden sm:inline">Survey</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0D6731]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Only Navigation Links */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-200 mt-4 pt-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-[#0D6731] text-white'
                    : 'text-gray-600 hover:bg-[#0D6731]/10'
                }`}
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center min-h-[80vh]">
        {/* Registration Form - Centered */}
        <div className="w-full max-w-2xl">
          <RegistrationForm />
        </div>
      </div>
    </div>
  )
}

function FeedbackPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center min-h-[80vh]">
        {/* Feedback Form - Centered */}
        <div className="w-full max-w-2xl">
          <FeedbackForm />
        </div>
      </div>
    </div>
  )
}

function SurveyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center min-h-[80vh]">
        {/* Survey Form - Centered */}
        <div className="w-full max-w-4xl">
          <SurveyForm />
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen relative">
        {/* Background Image with Overlay */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: 'url(/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay - 60% transparent (40% opacity) */}
          <div className="absolute inset-0 bg-white opacity-40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/registrations" element={<RegistrationsTable />} />
            <Route path="/admin/feedbacks" element={<FeedbacksTable />} />
            <Route path="/admin/surveys" element={<SurveysTable />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App

