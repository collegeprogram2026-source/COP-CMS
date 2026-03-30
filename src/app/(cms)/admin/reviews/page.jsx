"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { callApi } from "@/lib/apiClient"

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
        auth: true,
      })
      if (!res.ok) throw new Error("Failed to delete review")
      fetchReviews()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Reviews Management</h1>
            <p className="text-sm font-medium text-muted-foreground mt-2">
              Monitor and moderate user feedback across your providers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-card p-1.5 rounded-2xl border border-border shadow-sm">
            {/* Status Filter */}
            <div className="flex items-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-3 mr-2">Status</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-muted border-none text-xs font-bold text-foreground px-3 py-2 rounded-lg focus:ring-2 focus:ring-border outline-none transition-all cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="w-px h-6 bg-muted hidden sm:block" />

            {/* Provider Filter */}
            <div className="flex items-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 mr-2">Provider</span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-muted border-none text-xs font-bold text-foreground px-3 py-2 rounded-lg focus:ring-2 focus:ring-border outline-none transition-all cursor-pointer max-w-[150px]"
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

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-medium mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        {/* Reviews Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-foreground">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-[3px] border-border/50 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Reviews</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background border-b border-border/50">
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Reviewer</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Provider</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">Rating</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Review Info</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredReviews.map((review) => (
                    <tr key={review._id} className="group hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground tracking-tight">{review.name}</span>
                          <span className="text-[11px] font-medium text-muted-foreground tracking-tight">{review.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-lg border border-border/50">
                          {review.providerId?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100 w-fit mx-auto">
                          <span className="text-xs">★</span>
                          <span className="ml-1 text-xs font-bold">{review.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm font-bold text-foreground tracking-tight">{review.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">"{review.comment}"</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => toggleReviewStatus(review._id, review.isActive)}
                          variant="ghost"
                          size="sm"
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider transition-all hover:scale-105 active:scale-95 h-auto ${review.isActive
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border"
                            }`}
                        >
                          {review.isActive ? "Active" : "Inactive"}
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => deleteReview(review._id)}
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors h-auto"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Total Reviews</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-foreground tracking-tighter">{reviews.length}</p>
              <div className="mb-1.5 h-1.5 w-1.5 rounded-full bg-border" />
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 text-emerald-600/70">Active Reviews</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-emerald-600 tracking-tighter">
                {reviews.filter((r) => r.isActive).length}
              </p>
              <div className="mb-1.5 h-1.5 w-1.5 rounded-full bg-emerald-200" />
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 text-amber-600/70">Pending Approval</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-amber-600 tracking-tighter">
                {reviews.filter((r) => !r.isActive).length}
              </p>
              <div className="mb-1.5 h-1.5 w-1.5 rounded-full bg-amber-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

