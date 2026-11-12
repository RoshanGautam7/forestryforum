import axios from 'axios'

const API_BASE_URL = 'https://register.pngdhl.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const registerUser = async (formData) => {
  // Use axios directly to avoid default headers
  // For file uploads, don't set Content-Type - let browser set it with boundary automatically
  const response = await axios.post(`${API_BASE_URL}/register`, formData, {
    // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    timeout: 60000, // 60 seconds timeout for large file uploads
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    // Add onUploadProgress for better UX if needed
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    }
  })
  return response.data
}

// CRUD operations
export const getAllRegistrations = async (pin) => {
  const response = await api.get('/registrations', {
    params: { pin }
  })
  return response.data
}

export const getRegistrationById = async (id) => {
  const response = await api.get(`/registrations/${id}`)
  return response.data
}

export const updateRegistration = async (id, formData) => {
  // For FormData, let browser set Content-Type with boundary automatically
  // Use axios directly to avoid default headers
  const response = await axios.put(`${API_BASE_URL}/registrations/${id}`, formData)
  return response.data
}

export const deleteRegistration = async (id) => {
  const response = await api.delete(`/registrations/${id}`)
  return response.data
}

export const previewIDCard = (id) => {
  return `${API_BASE_URL}/registrations/${id}/preview`
}

// Feedback operations
export const createFeedback = async (feedbackData) => {
  const response = await api.post('/feedback', feedbackData)
  return response.data
}

export const getAllFeedbacks = async (pin) => {
  const response = await api.get('/feedbacks', {
    params: { pin }
  })
  return response.data
}

export const getFeedbackById = async (id, pin) => {
  const response = await api.get(`/feedbacks/${id}`, {
    params: { pin }
  })
  return response.data
}

export const deleteFeedback = async (id, pin) => {
  const response = await api.delete(`/feedbacks/${id}`, {
    params: { pin }
  })
  return response.data
}

export const markFeedbacksAsImportant = async (ids, pin) => {
  const response = await api.put('/feedbacks/mark-important', { ids }, {
    params: { pin }
  })
  return response.data
}

// Survey operations
export const createSurvey = async (surveyData) => {
  const response = await api.post('/survey', surveyData)
  return response.data
}

export const getAllSurveys = async (pin) => {
  const response = await api.get('/surveys', {
    params: { pin }
  })
  return response.data
}

export const getSurveyById = async (id, pin) => {
  const response = await api.get(`/surveys/${id}`, {
    params: { pin }
  })
  return response.data
}

export default api

