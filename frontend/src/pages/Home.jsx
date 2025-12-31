import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../utils/api'
import useAuth from '../hooks/useAuth'
import VideoCard from '../components/VideoCard'

const Home = () => {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(null)
  const limit = 10

  const observer = useRef()

  const loadPage = useCallback(
    async (pageToLoad = 1) => {
      if (!user) return
      if (pageToLoad === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      try {
        const { data } = await api.get('/videos', {
          params: { page: pageToLoad, limit },
        })

        // API returns pagination object under data.data (aggregatePaginate)
        const payload = data?.data || {}
        const docs = payload.docs || []

        setVideos((prev) => {
          if (pageToLoad === 1) return docs
          // append new unique videos
          const existingIds = new Set(prev.map((v) => v._id))
          const toAdd = docs.filter((d) => !existingIds.has(d._id))
          return [...prev, ...toAdd]
        })

        setPage(payload.page || pageToLoad)
        setTotalPages(payload.totalPages ?? null)
      } catch (err) {
        setError('Unable to load videos. Please login and try again.')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [user],
  )

  useEffect(() => {
    if (!user) return
    // reset when user changes
    setVideos([])
    setPage(1)
    setTotalPages(null)
    loadPage(1)
  }, [user, loadPage])

  const sentinelRef = useCallback(
    (node) => {
      if (loading || loadingMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          // only load next if we know there are more pages (or totalPages unknown)
          if (totalPages == null || page < totalPages) {
            loadPage(page + 1)
          }
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, loadingMore, loadPage, page, totalPages],
  )

  if (!user) {
    return (
      <div className="mt-6 rounded-xl border border-white/5 bg-yt-card p-6 text-center text-yt-muted">
        Sign in to view your personalized feed.
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-xl font-semibold text-white">Latest videos</h2>
      {loading && <p className="text-sm text-yt-muted">Loading videos...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {videos.length === 0 && !loading && (
        <p className="text-sm text-yt-muted">No videos found.</p>
      )}

      {/* sentinel element for infinite scroll */}
      <div ref={sentinelRef} />

      {loadingMore && <p className="text-sm text-yt-muted">Loading more videos...</p>}
    </div>
  )
}

export default Home




