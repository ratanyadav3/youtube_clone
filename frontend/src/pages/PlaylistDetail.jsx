import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiTrash2, FiPlus } from 'react-icons/fi'
import api from '../utils/api'
import VideoCard from '../components/VideoCard'
import useAuth from '../hooks/useAuth'

const PlaylistDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [availableVideos, setAvailableVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState('')

  useEffect(() => {
    if (id) {
      fetchPlaylist()
    }
  }, [id])

  const fetchPlaylist = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/playlist/${id}`)
      setPlaylist(data?.data)
    } catch (err) {
      setError('Unable to load playlist.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableVideos = async () => {
    try {
      const { data } = await api.get('/videos')
      const videos = data?.data?.docs || data?.data || []
      // Filter out videos already in playlist
      const playlistVideoIds = playlist?.videos?.map((v) => v._id) || []
      const available = videos.filter((v) => !playlistVideoIds.includes(v._id))
      setAvailableVideos(available)
    } catch (err) {
      setError('Unable to load videos.')
    }
  }

  const addVideoToPlaylist = async () => {
    if (!selectedVideo) return
    try {
      await api.patch(`/playlist/add/${selectedVideo}/${id}`)
      setShowAddModal(false)
      setSelectedVideo('')
      fetchPlaylist()
    } catch (err) {
      setError('Unable to add video to playlist.')
    }
  }

  const removeVideoFromPlaylist = async (videoId) => {
    if (!confirm('Remove this video from playlist?')) return
    try {
      await api.patch(`/playlist/remove/${videoId}/${id}`)
      fetchPlaylist()
    } catch (err) {
      setError('Unable to remove video from playlist.')
    }
  }

  if (loading) return <p className="text-yt-muted">Loading playlist...</p>
  if (error) return <p className="text-red-400">{error}</p>
  if (!playlist) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{playlist.name}</h2>
          <p className="mt-1 text-sm text-yt-muted">{playlist.description}</p>
          <p className="mt-1 text-xs text-yt-muted">
            {playlist.totalVideos || playlist.videos?.length || 0} videos
          </p>
        </div>
        {user?._id === playlist.owner?._id && (
          <button
            onClick={() => {
              fetchAvailableVideos()
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <FiPlus />
            Add Video
          </button>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-yt-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Add Video to Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-yt-muted">Select Video</label>
                <select
                  value={selectedVideo}
                  onChange={(e) => setSelectedVideo(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
                >
                  <option value="">Choose a video...</option>
                  {availableVideos.map((video) => (
                    <option key={video._id} value={video._id}>
                      {video.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addVideoToPlaylist}
                  className="flex-1 rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedVideo('')
                  }}
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {playlist.videos?.map((video) => (
          <div key={video._id} className="relative group">
            <VideoCard video={video} />
            {user?._id === playlist.owner?._id && (
              <button
                onClick={() => removeVideoFromPlaylist(video._id)}
                className="absolute top-2 right-2 rounded-full bg-black/70 p-2 text-red-400 opacity-0 transition group-hover:opacity-100"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
      </div>

      {playlist.videos?.length === 0 && (
        <p className="text-sm text-yt-muted">No videos in this playlist yet.</p>
      )}
    </div>
  )
}

export default PlaylistDetail




