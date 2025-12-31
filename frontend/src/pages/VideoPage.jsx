import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FiHeart, FiPlus } from 'react-icons/fi'
import api from '../utils/api'
import VideoPlayer from '../components/VideoPlayer'
import CommentSection from '../components/CommentSection'
import useAuth from '../hooks/useAuth'

const VideoPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [likeLoading, setLikeLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState('')

  const fetchVideo = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/videos/${id}`)
      const v = data?.data
      setVideo(v)
      checkIfLiked()
      if (v?.owner?.username && user) {
        try {
          const { data: channelRes } = await api.get(`/users/c/${v.owner.username}`)
          setIsSubscribed(!!channelRes?.data?.isSubscribed)
        } catch {
          // ignore subscription status errors
        }
      }
    } catch (err) {
      setError('Unable to load this video.')
    } finally {
      setLoading(false)
    }
  }

  const checkIfLiked = async () => {
    if (!user) return
    try {
      const { data } = await api.get('/likes/videos')
      const likedVideos = data?.data?.likedVideos || []
      const liked = likedVideos.some(
        (item) => (item.video?._id || item.video) === id || item._id === id,
      )
      setIsLiked(liked)
    } catch (err) {
      // Ignore error
    }
  }

  const fetchPlaylists = async () => {
    if (!user?._id) return
    try {
      const { data } = await api.get(`/playlist/user/${user._id}`)
      setPlaylists(data?.data?.playlists || [])
    } catch (err) {
      // Ignore error
    }
  }

  useEffect(() => {
    fetchVideo()
  }, [id])

  useEffect(() => {
    if (user) {
      checkIfLiked()
    }
  }, [user, id])

  const toggleLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setLikeLoading(true)
    try {
      await api.post(`/likes/toggle/v/${id}`)
      setIsLiked(!isLiked)
    } catch (err) {
      setError('Unable to like this video.')
    } finally {
      setLikeLoading(false)
    }
  }

  const addToPlaylist = async () => {
    if (!selectedPlaylist) return
    try {
      await api.patch(`/playlist/add/${id}/${selectedPlaylist}`)
      setShowPlaylistModal(false)
      setSelectedPlaylist('')
    } catch (err) {
      setError('Unable to add video to playlist.')
    }
  }

  const toggleSubscribe = async () => {
    if (!video?.owner?._id) return
    if (!user) {
      navigate('/login')
      return
    }
    if (user._id === video.owner._id) {
      alert('You cannot subscribe to yourself')
      return
    }
    setSubLoading(true)
    try {
      await api.post(`/subscriptions/u/${video.owner._id}`)
      setIsSubscribed((prev) => !prev)
    } catch (err) {
      setError('Unable to update subscription.')
    } finally {
      setSubLoading(false)
    }
  }

  if (loading) return <p className="text-yt-muted">Loading video...</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (!video) return null

  const owner = video.owner

  return (
    <div className="flex flex-col gap-6 lg:flex-row px-10 ">
      <div className="flex-1 space-y-3 ">
        <VideoPlayer src={video.videoFile} poster={video.thumbnail} />

        <div className="space-y-2 rounded-xl border border-white/5 bg-yt-card p-4">
          <h1 className="text-xl font-semibold text-white">{video.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-yt-muted">
            <span>{video.views} views</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            <button
              onClick={toggleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-white transition ${
                isLiked
                  ? 'bg-yt-red hover:bg-red-600'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <FiHeart className={isLiked ? 'fill-current' : ''} />
              {likeLoading ? '...' : isLiked ? 'Liked' : 'Like'}
            </button>
            {user && (
              <button
                onClick={() => {
                  fetchPlaylists()
                  setShowPlaylistModal(true)
                }}
                className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
              >
                <FiPlus />
                Save
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Link
              to={`/channel/${owner?.username}`}
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              <div className="h-12 w-12 overflow-hidden rounded-full bg-white/10">
                {owner?.avatar ? (
                  <img
                    src={owner.avatar}
                    alt={owner.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg text-yt-muted">
                    {owner?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white">{owner?.username}</p>
                <p className="text-xs text-yt-muted">Channel</p>
              </div>
            </Link>
            {user && (
              <button
                onClick={toggleSubscribe}
                disabled={subLoading}
                className={`rounded-full px-4 py-3 text-xs font-semibold text-white bg-white/10 transition ${
                  isSubscribed ? 'bg-white/10 hover:bg-white/10' : 'bg-white/5 hover:bg-gray-600 text-black'
                }`}
              >
                {subLoading ? '...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
          <p className="whitespace-pre-line text-sm text-white/90">{video.description}</p>
        </div>

        <CommentSection videoId={video._id} />
      </div>

      
      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-yt-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Save to Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-yt-muted">Select Playlist</label>
                <select
                  value={selectedPlaylist}
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
                >
                  <option value="">Choose a playlist...</option>
                  {playlists.map((playlist) => (
                    <option key={playlist._id} value={playlist._id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addToPlaylist}
                  className="flex-1 rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowPlaylistModal(false)
                    setSelectedPlaylist('')
                  }}
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
              {playlists.length === 0 && (
                <p className="text-sm text-yt-muted">
                  No playlists yet.{' '}
                  <Link to="/playlists" className="text-yt-red underline">
                    Create one
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPage




