import React, { useState, useEffect } from 'react'
import { getAllRegistrations, deleteRegistration, previewIDCard, updateRegistration } from '../services/api'
import DataTable from './DataTable'

const RegistrationsTable = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(false)
  const [storedPin] = useState(() => {
    return sessionStorage.getItem('adminPin') || ''
  })
  const [previewModal, setPreviewModal] = useState({ open: false, url: null })
  const [editModal, setEditModal] = useState({ open: false, data: null })
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    company_name: '',
    business_type: '',
    business_address: '',
    photo: null
  })

  useEffect(() => {
    if (storedPin) {
      fetchRegistrations(storedPin)
    }
  }, [storedPin])

  const fetchRegistrations = async (pin = storedPin) => {
    if (!pin) {
      window.location.href = '/admin'
      return
    }

    try {
      setLoading(true)
      const response = await getAllRegistrations(pin)
      setRegistrations(response.data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
      const errorMessage = error.response?.data?.message || 'Failed to fetch registrations'
      
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

  const handlePreview = async (id) => {
    try {
      const url = previewIDCard(id)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to load PDF')
      }
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      setPreviewModal({ open: true, url: blobUrl })
    } catch (error) {
      console.error('Error loading PDF:', error)
      alert('Failed to load PDF. Please try again.')
    }
  }

  const handleEdit = (registration) => {
    setFormData({
      full_name: registration.full_name,
      phone_number: registration.phone_number,
      email: registration.email,
      company_name: registration.company_name,
      business_type: registration.business_type,
      business_address: registration.business_address,
      photo: null
    })
    setEditModal({ open: true, data: registration })
  }

  const handleDelete = async () => {
    if (!deleteConfirm.id) return
    
    try {
      await deleteRegistration(deleteConfirm.id)
      alert('Registration deleted successfully')
      setDeleteConfirm({ open: false, id: null })
      fetchRegistrations()
    } catch (error) {
      console.error('Error deleting registration:', error)
      alert('Failed to delete registration')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editModal.data) return

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('full_name', formData.full_name)
      formDataToSend.append('phone_number', formData.phone_number)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('company_name', formData.company_name)
      formDataToSend.append('business_type', formData.business_type)
      formDataToSend.append('business_address', formData.business_address)
      
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo)
      }

      const result = await updateRegistration(editModal.data.id, formDataToSend)
      
      if (result.success) {
        alert('Registration updated successfully')
        setEditModal({ open: false, data: null })
        fetchRegistrations()
      } else {
        alert(result.message || 'Failed to update registration')
      }
    } catch (error) {
      console.error('Error updating registration:', error)
      alert(error.response?.data?.message || 'Failed to update registration')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      accessor: (item) => item.id
    },
    {
      key: 'photo',
      header: 'Photo',
      accessor: (item) => (
        item.photo_path ? (
          <img
            src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://register.pngdhl.com'}/${item.photo_path}`}
            alt={item.full_name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Photo</span>
          </div>
        )
      )
    },
    {
      key: 'full_name',
      header: 'Full Name',
      accessor: (item) => item.full_name,
      cellClassName: 'font-medium'
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (item) => item.email
    },
    {
      key: 'phone_number',
      header: 'Phone',
      accessor: (item) => item.phone_number
    },
    {
      key: 'company_name',
      header: 'Company',
      accessor: (item) => item.company_name
    },
    {
      key: 'business_type',
      header: 'Business Type',
      accessor: (item) => item.business_type
    },
    {
      key: 'created_at',
      header: 'Registered',
      type: 'date',
      accessor: (item) => item.created_at
    }
  ]

  const renderActions = (item) => (
    <div className="flex gap-2">
      <button
        onClick={() => handlePreview(item.id)}
        className="text-[#0D6731] hover:text-[#0a5225] px-2 py-1 rounded hover:bg-[#0D6731]/10 text-sm"
        title="Preview ID Card"
      >
        👁️ Preview
      </button>
      <button
        onClick={() => handleEdit(item)}
        className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 text-sm"
        title="Edit"
      >
        ✏️ Edit
      </button>
      <button
        onClick={() => setDeleteConfirm({ open: true, id: item.id })}
        className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 text-sm"
        title="Delete"
      >
        🗑️ Delete
      </button>
    </div>
  )

  return (
    <>
      <DataTable
        title="All Registrations"
        data={registrations}
        columns={columns}
        loading={loading}
        onRefresh={() => fetchRegistrations(storedPin)}
        searchable={true}
        searchPlaceholder="Search by name, email, company..."
        itemsPerPage={10}
        renderActions={renderActions}
      />

      {/* Preview Modal */}
      {previewModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">ID Card Preview</h2>
              <button
                onClick={() => {
                  if (previewModal.url && previewModal.url.startsWith('blob:')) {
                    URL.revokeObjectURL(previewModal.url)
                  }
                  setPreviewModal({ open: false, url: null })
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <iframe
                src={previewModal.url}
                type="application/pdf"
                className="w-full h-[80vh] border"
                title="ID Card Preview"
                allow="fullscreen"
              />
              <div className="mt-4 text-center">
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-[#0D6731] text-white rounded-lg hover:bg-[#0a5225] transition"
                >
                  Open PDF in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && editModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Edit Registration</h2>
                <button
                  onClick={() => setEditModal({ open: false, data: null })}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D6731]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D6731]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D6731]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D6731]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <select
                      value={formData.business_type}
                      onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D6731]"
                      required
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D6731]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                  <textarea
                    value={formData.business_address}
                    onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D6731]"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, data: null })}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#0D6731] text-white rounded-lg hover:bg-[#0a5225] transition"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this registration? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RegistrationsTable
