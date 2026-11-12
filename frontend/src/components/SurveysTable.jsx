import React, { useState, useEffect } from 'react'
import { getAllSurveys } from '../services/api'

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

const SurveysTable = () => {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [showResults, setShowResults] = useState({})
  const [storedPin] = useState(() => {
    return sessionStorage.getItem('adminPin') || ''
  })

  useEffect(() => {
    if (storedPin) {
      fetchSurveys(storedPin)
    }
  }, [storedPin])

  const fetchSurveys = async (pin = storedPin) => {
    if (!pin) {
      window.location.href = '/admin'
      return
    }

    try {
      setLoading(true)
      const response = await getAllSurveys(pin)
      setSurveys(response.data || [])
    } catch (error) {
      console.error('Error fetching surveys:', error)
      const errorMessage = error.response?.data?.message || 'Failed to fetch surveys'
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.removeItem('adminPin')
        window.location.href = '/admin'
      } else {
        alert(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleResults = (id) => {
    setShowResults(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const Chart = ({ yesPercent, noPercent }) => {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm font-medium">Yes: {yesPercent}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm font-medium">No: {noPercent}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-8 flex overflow-hidden">
          <div
            className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold transition-all duration-500"
            style={{ width: `${yesPercent}%` }}
          >
            {yesPercent > 5 && `${yesPercent}%`}
          </div>
          <div
            className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold transition-all duration-500"
            style={{ width: `${noPercent}%` }}
          >
            {noPercent > 5 && `${noPercent}%`}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0D6731]">
            All Surveys
          </h2>
          <button
            onClick={() => fetchSurveys(storedPin)}
            disabled={loading}
            className="bg-[#0D6731] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0a5225] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading && surveys.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6731]"></div>
            <p className="mt-4 text-gray-600">Loading surveys...</p>
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No surveys found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0D6731] text-white">
                  <th className="px-4 py-3 text-left border border-gray-300">ID</th>
                  <th className="px-4 py-3 text-left border border-gray-300">Name</th>
                  <th className="px-4 py-3 text-left border border-gray-300">Company</th>
                  <th className="px-4 py-3 text-left border border-gray-300">Position</th>
                  <th className="px-4 py-3 text-left border border-gray-300">Yes %</th>
                  <th className="px-4 py-3 text-left border border-gray-300">No %</th>
                  <th className="px-4 py-3 text-left border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <React.Fragment key={survey.id}>
                    <tr className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="px-4 py-3 border border-gray-200">{survey.id}</td>
                      <td className="px-4 py-3 border border-gray-200 font-medium">{survey.name}</td>
                      <td className="px-4 py-3 border border-gray-200">{survey.company_name}</td>
                      <td className="px-4 py-3 border border-gray-200">{survey.position}</td>
                      <td className="px-4 py-3 border border-gray-200">
                        <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {parseFloat(survey.yes_percent).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 border border-gray-200">
                        <span className="px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          {parseFloat(survey.no_percent).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 border border-gray-200">
                        <button
                          onClick={() => toggleResults(survey.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          {showResults[survey.id] ? 'Hide Results' : 'Show Results'}
                        </button>
                      </td>
                    </tr>
                    {showResults[survey.id] && (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 border border-gray-200 bg-gray-50">
                          <div className="space-y-6">
                            {/* Chart */}
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-3">Survey Results Chart</h4>
                              <Chart
                                yesPercent={parseFloat(survey.yes_percent)}
                                noPercent={parseFloat(survey.no_percent)}
                              />
                            </div>

                            {/* Detailed Responses */}
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-3">Detailed Responses</h4>
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {survey.survey_response && survey.survey_response.map((response, index) => (
                                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-700 mb-1">
                                          <span className="font-medium">{index + 1}.</span> {SURVEY_QUESTIONS[index]}
                                        </p>
                                      </div>
                                      <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                                        response === 'yes'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {response === 'yes' ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SurveysTable

