import React, { useState } from 'react'
import { registerUser } from '../services/api'

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    company_name: '',
    business_type: '',
    business_address: ''
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Validate file size before upload (5MB limit)
      if (photo && photo.size > 5 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'File size exceeds 5MB limit. Please choose a smaller image.'
        })
        setLoading(false)
        return
      }

      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key])
      })
      if (photo) {
        formDataToSend.append('photo', photo)
      }

      const response = await registerUser(formDataToSend)
      
      setMessage({
        type: 'success',
        text: response.message || 'Registration successful! Check your email for the ID card.'
      })
      
      // Reset form
      setFormData({
        full_name: '',
        phone_number: '',
        email: '',
        company_name: '',
        business_type: '',
        business_address: ''
      })
      setPhoto(null)
      setPhotoPreview(null)
      e.target.reset()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0D6731] rounded-2xl shadow-2xl p-8 w-full">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        PNG Forestry Forum Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-white mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-gray-800"
            placeholder="Enter your full name"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-white mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-gray-800"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-gray-800"
            placeholder="Enter your email address"
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

        {/* Business Type */}
        <div>
          <label htmlFor="business_type" className="block text-sm font-medium text-white mb-2">
            Type of Business <span className="text-red-500">*</span>
          </label>
          <select
            id="business_type"
            name="business_type"
            value={formData.business_type}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-gray-800"
          >
            <option value="">-- Select Type --</option>
            <option value="Forestry">Forestry</option>
            <option value="Plantation">Plantation</option>
            <option value="Timber Operation">Timber Industry</option>
            <option value="Government">Government</option>
            <option value="Land Owner">Land Owner</option>
            <option value="Development Partner">Development Partner</option>
            <option value="Civil Society">Civil Society</option>
            <option value="Logistics / Transport">Logistics / Transport</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Business Address */}
        <div>
          <label htmlFor="business_address" className="block text-sm font-medium text-white mb-2">
            Business Operation Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="business_address"
            name="business_address"
            value={formData.business_address}
            onChange={handleInputChange}
            required
            rows="4"
            className="w-full px-4 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none resize-y text-gray-800"
            placeholder="Enter your business operation address"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-white mb-2">
            Upload Photo (PNG/JPG) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <label className="bg-white text-[#0D6731] px-6 py-3 rounded-lg font-semibold cursor-pointer hover:bg-gray-100 transition-colors">
              Choose File
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handlePhotoChange}
                required
                className="hidden"
              />
            </label>
            <span className="text-white text-sm">
              {photo ? photo.name : 'No file chosen'}
            </span>
          </div>
          {photoPreview && (
            <div className="mt-4">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border-2 border-white"
              />
            </div>
          )}
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
          {loading ? 'Registering...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  )
}

export default RegistrationForm

