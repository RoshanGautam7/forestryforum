import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllRegistrations, getAllFeedbacks } from '../services/api'

const Admin = () => {
  const navigate = useNavigate()
  const [pinVerifying, setPinVerifying] = useState(false)
  const [storedPin, setStoredPin] = useState(() => {
    return sessionStorage.getItem('adminPin') || ''
  })
  const [pinModal, setPinModal] = useState({ 
    open: !storedPin,
    pin: '', 
    error: '' 
  })
  const [menuVisible, setMenuVisible] = useState(!!storedPin)

  useEffect(() => {
    if (storedPin) {
      verifyPin(storedPin)
    }
  }, [])

  const verifyPin = async (pin) => {
    try {
      // Try to fetch registrations to verify PIN
      await getAllRegistrations(pin)
      setStoredPin(pin)
      sessionStorage.setItem('adminPin', pin)
      setMenuVisible(true)
      setPinModal({ open: false, pin: '', error: '' })
    } catch (error) {
      setStoredPin('')
      sessionStorage.removeItem('adminPin')
      setMenuVisible(false)
      setPinModal({ 
        open: true, 
        pin: '', 
        error: error.response?.data?.message || 'Invalid PIN. Please try again.' 
      })
    }
  }

  const handlePinSubmit = async (e) => {
    e.preventDefault()
    if (!pinModal.pin.trim()) {
      setPinModal({ ...pinModal, error: 'Please enter a PIN' })
      return
    }

    setPinVerifying(true)
    setPinModal({ ...pinModal, error: '' })
    await verifyPin(pinModal.pin)
    setPinVerifying(false)
  }

  const handleLogout = () => {
    setStoredPin('')
    sessionStorage.removeItem('adminPin')
    setMenuVisible(false)
    setPinModal({ open: true, pin: '', error: '' })
  }

  if (!menuVisible) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#0D6731] mb-6 text-center">
              Admin Access
            </h2>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Admin PIN
                </label>
                <input
                  type="password"
                  id="pin"
                  value={pinModal.pin}
                  onChange={(e) => setPinModal({ ...pinModal, pin: e.target.value, error: '' })}
                  placeholder="Enter admin PIN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D6731] focus:outline-none"
                  autoFocus
                />
                {pinModal.error && (
                  <p className="mt-2 text-red-600 text-sm">{pinModal.error}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={pinVerifying}
                className="w-full bg-[#0D6731] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0a5225] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {pinVerifying ? 'Verifying...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0D6731]">
              Admin Panel
            </h2>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Logout
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* View Registrations Card */}
            <button
              onClick={() => navigate('/admin/registrations')}
              className="bg-gradient-to-br from-[#0D6731] to-[#0a5225] text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-xl font-bold mb-2">View Registrations</h3>
                <p className="text-white/80 text-sm">
                  View and manage all user registrations
                </p>
              </div>
            </button>

            {/* View Feedbacks Card */}
            <button
              onClick={() => navigate('/admin/feedbacks')}
              className="bg-gradient-to-br from-[#0D6731] to-[#0a5225] text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="text-xl font-bold mb-2">View Feedbacks</h3>
                <p className="text-white/80 text-sm">
                  View and manage all user feedbacks
                </p>
              </div>
            </button>

            {/* View Surveys Card */}
            <button
              onClick={() => navigate('/admin/surveys')}
              className="bg-gradient-to-br from-[#0D6731] to-[#0a5225] text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <h3 className="text-xl font-bold mb-2">View Surveys</h3>
                <p className="text-white/80 text-sm">
                  View survey results and analytics
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin

