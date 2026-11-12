import React, { useState, useMemo, useEffect } from 'react'

const DataTable = ({
  title,
  data = [],
  columns = [],
  loading = false,
  onRefresh,
  onDelete,
  searchable = true,
  searchPlaceholder = 'Search...',
  itemsPerPage = 10,
  renderActions = null
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((item) => {
      return columns.some((col) => {
        const value = col.accessor ? col.accessor(item) : item[col.key]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    })
  }, [data, searchTerm, columns])

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0D6731]">
            {title}
          </h2>
          <div className="flex gap-3">
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D6731] focus:outline-none w-full md:w-64"
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
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
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
            )}
          </div>
        </div>

        {/* Results count */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            Found {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} 
            {filteredData.length !== data.length && ` out of ${data.length} total`}
          </div>
        )}

        {/* Table */}
        {loading && !data.length ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6731]"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No results found for your search.' : `No ${title.toLowerCase()} found.`}
            </p>
          </div>
        ) : (
          <>
            {/* Scrollable table container: horizontal + vertical */}
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
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
                  {paginatedData.map((item, rowIdx) => (
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

                        // Format dates automatically
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                      })
                      .map((page, idx, arr) => {
                        // Add ellipsis if there's a gap
                        const showEllipsisBefore = idx > 0 && arr[idx - 1] !== page - 1
                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <span className="px-2 py-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DataTable

