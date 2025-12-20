import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import VideoCard from '../components/VideoCard'
import useAuth from '../hooks/useAuth'

const LikedVideos = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLikedVideos = async () => {
      if (!user) {
        navigate('/login')
        return
      }
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/likes/videos')
        const likedVideosArray = data?.data?.likedVideos || []
        // Extract video objects from liked videos
        const videoList = likedVideosArray.map((item) => item.video || item)
        setVideos(videoList)
      } catch (err) {
        setError('Unable to load liked videos.')
      } finally {
        setLoading(false)
      }
    }

    fetchLikedVideos()
  }, [user, navigate])

  if (!user) {
    return (
      <div className="rounded-xl border border-white/5 bg-yt-card p-6 text-center text-yt-muted">
        Please sign in to view your liked videos.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Liked Videos</h2>
      {loading && <p className="text-sm text-yt-muted">Loading...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
      {!loading && videos.length === 0 && (
        <p className="text-sm text-yt-muted">No liked videos yet.</p>
      )}
    </div>
  )
}

export default LikedVideos




