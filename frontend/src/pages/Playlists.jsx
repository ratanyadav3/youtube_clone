import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi'
import api from '../utils/api'
import useAuth from '../hooks/useAuth'

const Playlists = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const [editingPlaylist, setEditingPlaylist] = useState(null)
  const [editData, setEditData] = useState({ name: '', description: '' })
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPlaylists()
    }
  }, [user])

  const fetchPlaylists = async () => {
    if (!user?._id) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/playlist/user/${user._id}`)
      setPlaylists(data?.data?.playlists || [])
    } catch (err) {
      setError('Unable to load playlists.')
    } finally {
      setLoading(false)
    }
  }

  const createPlaylist = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/playlist', formData)
      setFormData({ name: '', description: '' })
      setShowCreateModal(false)
      fetchPlaylists()
    } catch (err) {
      setError('Unable to create playlist.')
    } finally {
      setLoading(false)
    }
  }

  const deletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return
    try {
      await api.delete(`/playlist/${playlistId}`)
      fetchPlaylists()
    } catch (err) {
      setError('Unable to delete playlist.')
    }
  }

  const openEditModal = (playlist) => {
    setEditingPlaylist(playlist)
    setEditData({ name: playlist.name || '', description: playlist.description || '' })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setEditingPlaylist(null)
    setEditData({ name: '', description: '' })
    setShowEditModal(false)
  }

  const updatePlaylist = async (e) => {
    e.preventDefault()
    if (!editingPlaylist?._id) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.patch(`/playlist/${editingPlaylist._id}`, editData)
      const updated = data?.data
      if (updated?._id) {
        setPlaylists((prev) => prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)))
      }
      closeEditModal()
    } catch (err) {
      setError('Unable to update playlist.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-white/5 bg-yt-card p-6 text-center text-yt-muted">
        Please sign in to view your playlists.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">My Playlists</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <FiPlus />
          Create Playlist
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-yt-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Create Playlist</h3>
            <form onSubmit={createPlaylist} className="space-y-4">
              <div>
                <label className="text-sm text-yt-muted">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-yt-muted">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 h-24 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading && <p className="text-sm text-yt-muted">Loading...</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            className="group rounded-xl border border-white/5 bg-yt-card p-4 transition hover:border-white/10"
          >
            <Link to={`/playlist/${playlist._id}`}>
              <h3 className="mb-2 text-lg font-semibold text-white">{playlist.name}</h3>
              <p className="mb-2 text-sm text-yt-muted line-clamp-2">{playlist.description}</p>
              <p className="text-xs text-yt-muted">
                {playlist.totalVideos || 0} videos
              </p>
            </Link>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => openEditModal(playlist)}
                className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs text-white transition hover:bg-white/10"
              >
                <FiEdit2 />
                Edit
              </button>
              <button
                onClick={() => deletePlaylist(playlist._id)}
                className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs text-red-400 transition hover:bg-white/10"
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && editingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-yt-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Edit Playlist</h3>
            <form onSubmit={updatePlaylist} className="space-y-4">
              <div>
                <label className="text-sm text-yt-muted">Name</label>
                <input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-yt-muted">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="mt-1 h-24 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!loading && playlists.length === 0 && (
        <p className="text-sm text-yt-muted">No playlists yet. Create one to get started!</p>
      )}
    </div>
  )
}

export default Playlists




