import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import VideoCard from '../components/VideoCard'
import useAuth from '../hooks/useAuth'

const Channel = () => {
  const { username } = useParams()
  const { user } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [subLoading, setSubLoading] = useState(false)

  const fetchChannel = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data: channelRes } = await api.get(`/users/c/${username}`)
      const channelData = channelRes?.data
      setChannel(channelData)

      if (channelData?._id) {
        const { data: videoRes } = await api.get(`/videos?userId=${channelData._id}`)
        setVideos(videoRes?.data?.docs || videoRes?.data || [])

        const { data: playlistRes } = await api.get(`/playlist/user/${channelData._id}`)
        setPlaylists(playlistRes?.data?.playlists || [])
      } else {
        setVideos([])
        setPlaylists([])
      }
    } catch (err) {
      setError('Unable to load channel.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChannel()
  }, [username, user])

  const toggleSubscription = async () => {
    if (!channel?._id) return
    if (user?._id === channel._id) {
      alert('You cannot subscribe to yourself')
      return
    }
    setSubLoading(true)
    try {
      await api.post(`/subscriptions/u/${channel._id}`)
      fetchChannel()
    } catch (err) {
      setError('Unable to update subscription.')
    } finally {
      setSubLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-white/5 bg-yt-card p-6 text-center text-yt-muted">
        Sign in to view channels.
      </div>
    )
  }

  if (loading) return <p className="text-yt-muted">Loading channel...</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (!channel) return null

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-yt-card">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="Cover" className="h-48 w-full object-cover" />
        )}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-white/10">
              {channel.avatar ? (
                <img src={channel.avatar} alt={channel.username} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg text-yt-muted">
                  {channel.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{channel.fullName}</p>
              <p className="text-sm text-yt-muted">
                @{channel.username} · {channel.subscribersCount} subscribers
              </p>
            </div>
          </div>
          <button
            onClick={toggleSubscription}
            disabled={subLoading}
            className="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
          >
            {subLoading ? '...' : channel.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">Videos</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
        {videos.length === 0 && <p className="text-sm text-yt-muted">No videos uploaded yet.</p>}
      </div>

      <div>
        <h3 className="mt-6 text-lg font-semibold text-white">Playlists</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Link
              key={playlist._id}
              to={`/playlist/${playlist._id}`}
              className="rounded-xl border border-white/5 bg-yt-card p-4 transition hover:border-white/10 hover:bg-white/5"
            >
              <p className="text-base font-semibold text-white">{playlist.name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-yt-muted">{playlist.description}</p>
              <p className="mt-1 text-xs text-yt-muted">
                {playlist.totalVideos || 0} videos
              </p>
            </Link>
          ))}
        </div>
        {playlists.length === 0 && (
          <p className="text-sm text-yt-muted">This channel has no playlists yet.</p>
        )}
      </div>
    </div>
  )
}

export default Channel




