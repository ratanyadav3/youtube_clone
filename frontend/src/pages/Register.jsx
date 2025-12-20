import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Register = () => {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  })
  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!avatar) {
      setError('Avatar is required')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.append(key, value))
    formData.append('avatar', avatar)
    if (coverImage) formData.append('coverImage', coverImage)

    try {
      await register(formData)
      await login({ email: form.email, password: form.password })
      navigate('/')
    } catch (err) {
      setError('Registration failed. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-red-200 bg-yt-card p-8 shadow-yt-sm">
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-sm text-yt-muted">Join to upload videos and interact with others.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm text-yt-muted">Full name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label className="text-sm text-yt-muted">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="janedoe"
              required
            />
          </div>
          <div>
            <label className="text-sm text-yt-muted">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-yt-muted">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="text-sm text-yt-muted">Avatar (required)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm text-white border-2 border-white/10 rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="text-sm text-yt-muted">Cover image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm text-white border-2 border-white/10 rounded-lg p-2"
            />
          </div>

          {error && (
            <p className="md:col-span-2 text-sm text-red-400" aria-live="polite">
              {error}
            </p>
          )}

          <div className="md:col-span-2 mt-2 mb-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-yt-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-white underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register




