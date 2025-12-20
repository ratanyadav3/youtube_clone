import { useEffect, useState } from 'react'
import api from '../utils/api'
import useAuth from '../hooks/useAuth'
import VideoCard from '../components/VideoCard'

const Home = () => {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/videos')
        setVideos(data?.data?.docs || data?.data || [])
      } catch (err) {
        setError('Unable to load videos. Please login and try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [user])

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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
      {!loading && videos.length === 0 && (
        <p className="text-sm text-yt-muted">No videos found.</p>
      )}
    </div>
  )
}

export default Home




