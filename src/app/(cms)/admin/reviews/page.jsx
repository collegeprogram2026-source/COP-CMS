"use client"

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";
export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [filteredReviews, setFilteredReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all") // "all", "active", "inactive"
  const [selectedProvider, setSelectedProvider] = useState("") // filter by provider
  const [providers, setProviders] = useState([])

  // Fetch reviews and providers on mount
  useEffect(() => {
    fetchReviews()
    fetchProviders()
  }, [])

  // Filter reviews whenever filter or selectedProvider changes
  useEffect(() => {
    let filtered = reviews

    // Filter by active status
    if (filter === "active") {
      filtered = filtered.filter((r) => r.isActive === true)
    } else if (filter === "inactive") {
      filtered = filtered.filter((r) => r.isActive === false)
    }

    // Filter by provider
    if (selectedProvider) {
      filtered = filtered.filter((r) => r.providerId?._id === selectedProvider)
    }

    setFilteredReviews(filtered)
  }, [reviews, filter, selectedProvider])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await callApi("/api/admin/reviews", { auth: true })
      if (!res.ok) throw new Error("Failed to fetch reviews")
      const data = await res.json()
      setReviews(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      const res = await callApi("/api/admin/providers", { auth: true })
      if (!res.ok) throw new Error("Failed to fetch providers")
      const data = await res.json()
      setProviders(data)
    } catch (err) {
      console.error("Error fetching providers:", err)
    }
  }

  const toggleReviewStatus = async (id, currentStatus) => {
    try {
      const res = await callApi(`/api/admin/reviews/${id}`, {
        method: "PUT",
        auth: true,
        body: { isActive: !currentStatus },
      })
      if (!res.ok) throw new Error("Failed to update status")
      fetchReviews()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteReview = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return
    try {
      const res = await callApi(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        auth: true
      })
      if (!res.ok) throw new Error("Failed to delete review")
      fetchReviews()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex">
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Reviews Management</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Reviews</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              {/* Provider Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Providers</option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider._id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reviews Table */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No reviews found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Reviewer
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredReviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{review.name}</p>
                          <p className="text-gray-500 text-xs">{review.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {review.providerId?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1 font-semibold">{review.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          <p className="font-medium">{review.title}</p>
                          <p className="text-gray-500 text-xs line-clamp-2">{review.comment}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => toggleReviewStatus(review._id, review.isActive)}
                          title="Click to toggle status"
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 ${review.isActive
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                        >
                          {review.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => deleteReview(review._id)}
                          className="text-red-600 hover:text-red-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Active Reviews</p>
              <p className="text-2xl font-bold text-green-600">
                {reviews.filter((r) => r.isActive).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reviews.filter((r) => !r.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
