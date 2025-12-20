import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiEye, FiHeart, FiUsers, FiVideo, FiTrendingUp, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import api from '../utils/api'
import VideoCard from '../components/VideoCard'
import useAuth from '../hooks/useAuth'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // edit modal state
  const [editingVideo, setEditingVideo] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '' })
  const [editThumbnail, setEditThumbnail] = useState(null)
  const [editing, setEditing] = useState(false)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, videosRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/videos'),
      ])
      setStats(statsRes.data?.data)
      setVideos(videosRes.data?.data?.videos || [])
    } catch (err) {
      setError('Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (video) => {
    setEditingVideo(video)
    setEditForm({ title: video.title || '', description: video.description || '' })
    setEditThumbnail(null)
    setActionError(null)
  }

  const closeEditModal = () => {
    setEditingVideo(null)
    setEditForm({ title: '', description: '' })
    setEditThumbnail(null)
    setEditing(false)
    setActionError(null)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    if (!editingVideo?._id) return
    setEditing(true)
    setActionError(null)

    const data = new FormData()
    data.append('title', editForm.title)
    data.append('description', editForm.description)
    if (editThumbnail) {
      data.append('thumbnail', editThumbnail)
    }

    try {
      const res = await api.patch(`/videos/${editingVideo._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const updated = res?.data?.data
      if (updated?._id) {
        setVideos((prev) => prev.map((v) => (v._id === updated._id ? updated : v)))
        closeEditModal()
      }
    } catch (err) {
      setActionError('Unable to update video. Please try again.')
    } finally {
      setEditing(false)
    }
  }

  const deleteVideo = async (videoId) => {
    if (!videoId) return
    if (!window.confirm('Are you sure you want to delete this video?')) return
    setActionError(null)
    try {
      await api.delete(`/videos/${videoId}`)
      setVideos((prev) => prev.filter((v) => v._id !== videoId))
    } catch (err) {
      setActionError('Unable to delete video.')
    }
  }

  const togglePublish = async (video) => {
    if (!video?._id) return
    setActionError(null)
    try {
      const res = await api.patch(`/videos/toggle/publish/${video._id}`)
      const updated = res?.data?.data
      if (updated?._id) {
        setVideos((prev) => prev.map((v) => (v._id === updated._id ? updated : v)))
      }
    } catch (err) {
      setActionError('Unable to update publish status.')
    }
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-white/5 bg-yt-card p-6 text-center text-yt-muted">
        Please sign in to view your dashboard.
      </div>
    )
  }

  if (loading) return <p className="text-yt-muted">Loading dashboard...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Channel Analytics</h2>
        <p className="text-sm text-yt-muted">Overview of your channel performance</p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-yt-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <FiUsers className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-yt-muted">Subscribers</p>
                <p className="text-xl font-semibold text-white">
                  {stats.totalSubscribers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-yt-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/20 p-2">
                <FiVideo className="text-red-400" />
              </div>
              <div>
                <p className="text-xs text-yt-muted">Total Videos</p>
                <p className="text-xl font-semibold text-white">{stats.totalVideos || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-yt-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <FiEye className="text-green-400" />
              </div>
              <div>
                <p className="text-xs text-yt-muted">Total Views</p>
                <p className="text-xl font-semibold text-white">{stats.totalViews || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-yt-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-pink-500/20 p-2">
                <FiHeart className="text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-yt-muted">Total Likes</p>
                <p className="text-xl font-semibold text-white">
                  {stats.totalLikesOnVideos || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-yt-card p-4">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="text-yt-muted" />
              <p className="text-sm font-semibold text-white">Average Views per Video</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {stats.averageViewsPerVideo || 0}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-yt-card p-4">
            <p className="text-sm font-semibold text-white">Recent Activity</p>
            {stats.recentVideos?.length > 0 ? (
              <div className="mt-2 space-y-2">
                {stats.recentVideos.map((video) => (
                  <div key={video._id} className="flex items-center justify-between text-sm">
                    <span className="text-white">{video.title}</span>
                    <span className="text-yt-muted">{video.views} views</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-yt-muted">No recent videos</p>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Your Videos</h3>
          <Link
            to="/upload"
            className="rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Upload New Video
          </Link>
        </div>

        {actionError && <p className="mb-2 text-sm text-red-400">{actionError}</p>}

        {videos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <div key={video._id} className="relative rounded-xl">
                <VideoCard video={video} />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-yt-muted">
                  <div className="flex items-center gap-2">
                    <span>{video.views} views</span>
                    <span>•</span>
                    <span>{video.likesCount || 0} likes</span>
                    <span>•</span>
                    <span
                      className={`${
                        video.isPublished ? 'text-green-400' : 'text-yellow-400'
                      }`}
                    >
                      {video.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(video)}
                      className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[11px] text-white transition hover:bg-white/10"
                    >
                      <FiEdit2 />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublish(video)}
                      className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[11px] text-white transition hover:bg-white/10"
                    >
                      {video.isPublished ? (
                        <>
                          <FiToggleLeft />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <FiToggleRight />
                          Publish
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteVideo(video._id)}
                      className="flex items-center gap-1 rounded-lg bg-red-500/20 px-2 py-1 text-[11px] text-red-400 transition hover:bg-red-500/30"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-yt-muted">No videos uploaded yet.</p>
        )}
      </div>

      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-yt-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Edit Video</h3>
            <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="text-sm text-yt-muted">Title</label>
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-yt-muted">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="mt-1 h-28 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-yt-muted">Thumbnail (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditThumbnail(e.target.files?.[0] || null)}
                  className="mt-1 w-full text-sm text-white"
                />
              </div>
              {actionError && <p className="text-sm text-red-400">{actionError}</p>}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {editing ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard




