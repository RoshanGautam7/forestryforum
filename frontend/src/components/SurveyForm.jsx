import React, { useState } from 'react'
import { createSurvey } from '../services/api'

const SURVEY_QUESTIONS = [
  "Do you clearly understand the Government's decision to stop round log exports?",
  "Were you aware that this policy will take effect on 24 December 2025?",
  "Do you support processing all timber products within Papua New Guinea?",
  "Do you believe on-shore processing will create more local jobs?",
  "Do you think this policy can increase long-term benefits for landowners?",
  "Do you feel landowners have been adequately consulted on this policy so far?",
  "Do you believe the forestry industry has enough time to adjust to this change?",
  "Do you see value in exporting processed timber instead of raw logs?",
  "Do you think this policy will strengthen PNG's forest management in the long run?",
  "Do you expect this change to attract new investment into timber processing?",
  "Do you believe existing forestry agreements should be respected during the transition?",
  "Do you think small-scale operators will need extra support to adapt to this policy?",
  "Do you feel the Government should provide clear guidelines for the transition period?",
  "Do you believe this policy can improve environmental protection in PNG forests?",
  "Do you think communities near logging areas will benefit from local processing plants?",
  "Do you believe training and skills development will be necessary for this transition?",
  "Do you feel confident that risks such as job losses can be managed appropriately?",
  "Do you think public-private partnerships can help make this policy successful?",
  "Do you support the development of a clear and fair Transition Plan?",
  "Do you believe today's forum discussions will help shape better forestry outcomes?"
]

const SurveyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    position: '',
    survey_response: Array(20).fill('')
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

  const handleQuestionChange = (index, value) => {
    const newResponses = [...formData.survey_response]
    newResponses[index] = value
    setFormData(prev => ({
      ...prev,
      survey_response: newResponses
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Validate all questions are answered
    if (formData.survey_response.some(r => r === '')) {
      setMessage({
        type: 'error',
        text: 'Please answer all 20 questions before submitting.'
      })
      setLoading(false)
      return
    }

    try {
      const response = await createSurvey(formData)
      
      setMessage({
        type: 'success',
        text: response.message || 'Survey submitted successfully! Thank you for your participation.'
      })
      
      // Reset form
      setFormData({
        name: '',
        company_name: '',
        position: '',
        survey_response: Array(20).fill('')
      })
      e.target.reset()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to submit survey. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const answeredCount = formData.survey_response.filter(r => r !== '').length

  return (
    <div className="bg-[#0D6731] rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        Forestry Policy Survey
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white/10 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
          
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
              placeholder="Enter your full name"
            />
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-white mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-gray-800"
              placeholder="Enter your company name"
            />
          </div>

          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-white mb-2">
              Position in Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-gray-800"
              placeholder="Enter your position"
            />
          </div>
        </div>

        {/* Survey Questions */}
        <div className="bg-white/10 rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Survey Questions</h3>
            <span className="text-white text-sm">
              Progress: {answeredCount}/20
            </span>
          </div>

          {SURVEY_QUESTIONS.map((question, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm font-medium text-white mb-3">
                {index + 1}. {question} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${index}`}
                    value="yes"
                    checked={formData.survey_response[index] === 'yes'}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    required
                    className="w-5 h-5 text-[#0D6731] focus:ring-2 focus:ring-white"
                  />
                  <span className="ml-2 text-white font-medium">Yes</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${index}`}
                    value="no"
                    checked={formData.survey_response[index] === 'no'}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    required
                    className="w-5 h-5 text-[#0D6731] focus:ring-2 focus:ring-white"
                  />
                  <span className="ml-2 text-white font-medium">No</span>
                </label>
              </div>
            </div>
          ))}
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
          disabled={loading || answeredCount < 20}
          className="w-full bg-white text-[#0D6731] py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0D6731] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : answeredCount < 20 ? `Please answer all questions (${answeredCount}/20)` : 'Submit Survey'}
        </button>
      </form>
    </div>
  )
}

export default SurveyForm

