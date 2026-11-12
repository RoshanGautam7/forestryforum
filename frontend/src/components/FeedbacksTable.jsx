import React, { useState, useEffect, useMemo } from 'react'
import { getAllFeedbacks, deleteFeedback, markFeedbacksAsImportant } from '../services/api'

const FeedbacksTable = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showImportantOnly, setShowImportantOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [storedPin] = useState(() => {
    return sessionStorage.getItem('adminPin') || ''
  })
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })

  useEffect(() => {
    if (storedPin) {
      fetchFeedbacks(storedPin)
    }
  }, [storedPin])

  const fetchFeedbacks = async (pin = storedPin) => {
    if (!pin) return

    try {
      setLoading(true)
      const response = await getAllFeedbacks(pin)
      setFeedbacks(response.data || [])
      setSelectedIds(new Set()) // Clear selection on refresh
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      const errorMessage = error.response?.data?.message || 'Failed to fetch feedbacks'
      
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

  // Filter feedbacks based on showImportantOnly and search
  const filteredFeedbacks = useMemo(() => {
    let filtered = feedbacks

    // Filter by important
    if (showImportantOnly) {
      filtered = filtered.filter(f => f.is_important === true)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(term) || 
        f.question.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [feedbacks, showImportantOnly, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1) // Reset to page 1 when filter/search changes
  }, [showImportantOnly, searchTerm])

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredFeedbacks.map(f => f.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id, checked) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleMarkAsImportant = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one feedback to mark as important')
      return
    }

    try {
      setLoading(true)
      await markFeedbacksAsImportant(Array.from(selectedIds), storedPin)
      await fetchFeedbacks(storedPin)
      setSelectedIds(new Set())
      alert('Selected feedbacks marked as important successfully!')
    } catch (error) {
      console.error('Error marking feedbacks as important:', error)
      alert(error.response?.data?.message || 'Failed to mark feedbacks as important')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      await deleteFeedback(id, storedPin)
      await fetchFeedbacks(storedPin)
      setDeleteConfirm({ open: false, id: null })
    } catch (error) {
      console.error('Error deleting feedback:', error)
      alert(error.response?.data?.message || 'Failed to delete feedback')
    } finally {
      setLoading(false)
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

  // Columns for normal view
  const normalColumns = [
    {
      key: 'checkbox',
      header: (
        <input
          type="checkbox"
          checked={filteredFeedbacks.length > 0 && selectedIds.size === filteredFeedbacks.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 text-[#0D6731] border-gray-300 rounded focus:ring-[#0D6731]"
        />
      ),
      accessor: (item) => (
        <input
          type="checkbox"
          checked={selectedIds.has(item.id)}
          onChange={(e) => handleSelectOne(item.id, e.target.checked)}
          className="w-4 h-4 text-[#0D6731] border-gray-300 rounded focus:ring-[#0D6731]"
        />
      ),
      className: 'w-12'
    },
    {
      key: 'id',
      header: 'ID',
      accessor: (item) => item.id
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (item) => item.name,
      cellClassName: 'font-medium'
    },
    {
      key: 'question',
      header: 'Question',
      accessor: (item) => (
        <div className="max-w-md" title={item.question}>
          <div className="whitespace-normal break-words">{item.question}</div>
        </div>
      ),
      cellClassName: 'max-w-md'
    },
    {
      key: 'asked_at_event',
      header: 'Asked at Event',
      accessor: (item) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
          item.asked_at_event 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.asked_at_event ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Date',
      type: 'date',
      accessor: (item) => item.created_at
    },
    {
      key: 'is_important',
      header: 'Important',
      accessor: (item) => (
        item.is_important ? (
          <span className="px-2 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            ⭐ Important
          </span>
        ) : null
      )
    }
  ]

  // Columns for important-only view (simplified)
  const importantColumns = [
    {
      key: 'checkbox',
      header: (
        <input
          type="checkbox"
          checked={filteredFeedbacks.length > 0 && selectedIds.size === filteredFeedbacks.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 text-[#0D6731] border-gray-300 rounded focus:ring-[#0D6731]"
        />
      ),
      accessor: (item) => (
        <input
          type="checkbox"
          checked={selectedIds.has(item.id)}
          onChange={(e) => handleSelectOne(item.id, e.target.checked)}
          className="w-4 h-4 text-[#0D6731] border-gray-300 rounded focus:ring-[#0D6731]"
        />
      ),
      className: 'w-12'
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (item) => item.name,
      cellClassName: 'font-medium'
    },
    {
      key: 'question',
      header: 'Question',
      accessor: (item) => (
        <div className="max-w-2xl" title={item.question}>
          <div className="whitespace-normal">{item.question}</div>
        </div>
      ),
      cellClassName: 'max-w-2xl'
    }
  ]

  const columns = showImportantOnly ? importantColumns : normalColumns

  const renderActions = (item) => (
    <button
      onClick={() => setDeleteConfirm({ open: true, id: item.id })}
      disabled={loading}
      className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      Delete
    </button>
  )

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
          {/* Header with filter and actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0D6731]">
              {showImportantOnly ? 'Important Questions' : 'All Feedbacks'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {/* Filter Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showImportantOnly}
                  onChange={(e) => {
                    setShowImportantOnly(e.target.checked)
                    setSelectedIds(new Set()) // Clear selection when toggling filter
                  }}
                  className="w-5 h-5 text-[#0D6731] border-gray-300 rounded focus:ring-[#0D6731]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show Important Only
                </span>
              </label>

              {/* Mark as Important Button */}
              {selectedIds.size > 0 && (
                <button
                  onClick={handleMarkAsImportant}
                  disabled={loading}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  Mark as Important ({selectedIds.size})
                </button>
              )}

              {/* Refresh Button */}
              <button
                onClick={() => fetchFeedbacks(storedPin)}
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
          </div>

          {/* Selection info */}
          {selectedIds.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {selectedIds.size} feedback{selectedIds.size !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or question..."
                className="w-full md:w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D6731] focus:outline-none"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Results count */}
          {searchTerm && (
            <div className="mb-4 text-sm text-gray-600">
              Found {filteredFeedbacks.length} result{filteredFeedbacks.length !== 1 ? 's' : ''} 
              {filteredFeedbacks.length !== feedbacks.length && ` out of ${feedbacks.length} total`}
            </div>
          )}

          {/* Table */}
          {loading && filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6731]"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {showImportantOnly ? 'No important questions found.' : 'No feedbacks found.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#0D6731] text-white">
                    {columns.map((col, idx) => (
                      <th
                        key={col.key || idx}
                        className={`px-4 py-3 text-left border border-gray-300 ${col.className || ''}`}
                      >
                        {col.header}
                      </th>
                    ))}
                    {renderActions && (
                      <th className="px-4 py-3 text-left border border-gray-300">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedFeedbacks.map((item, rowIdx) => (
                    <tr
                      key={item.id || rowIdx}
                      className="hover:bg-gray-50 border-b border-gray-200"
                    >
                      {columns.map((col, colIdx) => {
                        let cellContent
                        if (col.render) {
                          cellContent = col.render(item)
                        } else if (col.accessor) {
                          cellContent = col.accessor(item)
                        } else {
                          cellContent = item[col.key]
                        }

                        if (col.type === 'date' && cellContent) {
                          cellContent = formatDate(cellContent)
                        }

                        return (
                          <td
                            key={col.key || colIdx}
                            className={`px-4 py-3 border border-gray-200 ${col.cellClassName || ''}`}
                          >
                            {cellContent}
                          </td>
                        )
                      })}
                      {renderActions && (
                        <td className="px-4 py-3 border border-gray-200">
                          {renderActions(item)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredFeedbacks.length)} of {filteredFeedbacks.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                    })
                    .map((page, idx, arr) => {
                      const showEllipsisBefore = idx > 0 && arr[idx - 1] !== page - 1
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <span className="px-2 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-[#0D6731] text-white border-[#0D6731]'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      )
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this feedback? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null })}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FeedbacksTable
