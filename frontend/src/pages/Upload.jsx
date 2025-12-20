import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const Upload = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '' })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile || !thumbnail) {
      setError('Video and thumbnail are required')
      return
    }

    setLoading(true)
    setError(null)

    const data = new FormData()
    data.append('title', form.title)
    data.append('description', form.description)
    data.append('videoFile', videoFile)
    data.append('thumbnail', thumbnail)

    try {
      const response = await api.post('/videos', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const newVideo = response?.data?.data
      if (newVideo?._id) {
        navigate(`/watch/${newVideo._id}`)
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-white/5 bg-yt-card p-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Upload video</h1>
        <p className="text-sm text-yt-muted">Add your title, description, and media files.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-yt-muted">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
            placeholder="An interesting video"
            required
          />
        </div>
        <div>
          <label className="text-sm text-yt-muted">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-1 h-28 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
            placeholder="What is this video about?"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-yt-muted">Video file</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="text-sm text-yt-muted">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm text-white"
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  )
}

export default Upload




