import React, { useState } from 'react'
import { createFeedback } from '../services/api'

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    question: '',
    asked_at_event: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRadioChange = (e) => {
    setFormData(prev => ({
      ...prev,
      asked_at_event: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await createFeedback(formData)
      
      setMessage({
        type: 'success',
        text: response.message || 'Thank you for your question! We will get back to you soon.'
      })
      
      // Reset form
      setFormData({
        name: '',
        question: '',
        asked_at_event: ''
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to submit question. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0D6731] rounded-2xl shadow-2xl p-8 w-full">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        Ask a Question
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-gray-800"
            placeholder="Enter your name"
          />
        </div>

        {/* Question */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-white mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            id="question"
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            required
            rows="6"
            className="w-full px-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none resize-y text-gray-800"
            placeholder="Enter your question"
          />
        </div>

        {/* Did you get a chance to ask question at the event? */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Did you get a chance to ask question at the event? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="asked_at_event"
                value="yes"
                checked={formData.asked_at_event === 'yes'}
                onChange={handleRadioChange}
                required
                className="w-5 h-5 text-[#0D6731] focus:ring-2 focus:ring-white"
              />
              <span className="ml-2 text-white font-medium">Yes</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="asked_at_event"
                value="no"
                checked={formData.asked_at_event === 'no'}
                onChange={handleRadioChange}
                required
                className="w-5 h-5 text-[#0D6731] focus:ring-2 focus:ring-white"
              />
              <span className="ml-2 text-white font-medium">No</span>
            </label>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-[#0D6731] py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0D6731] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Question'}
        </button>
      </form>
    </div>
  )
}

export default FeedbackForm

