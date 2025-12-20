import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import VideoCard from '../components/VideoCard'
import useAuth from '../hooks/useAuth'

const Search = () => {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const searchVideos = async () => {
      if (!user || !query) return
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/videos?query=${encodeURIComponent(query)}`)
        setResults(data?.data?.docs || data?.data || [])
      } catch (err) {
        setError('Unable to search videos.')
      } finally {
        setLoading(false)
      }
    }

    searchVideos()
  }, [query, user])

  if (!user) {
    return (
      <div className="rounded-xl border border-white/5 bg-yt-card p-6 text-center text-yt-muted">
        Sign in to search videos.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Search results for "{query}"</h2>
      {loading && <p className="text-sm text-yt-muted">Searching...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
      {!loading && results.length === 0 && (
        <p className="text-sm text-yt-muted">No results found.</p>
      )}
    </div>
  )
}

export default Search




