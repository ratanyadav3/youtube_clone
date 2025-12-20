import { useEffect, useState } from 'react'
import { FiHeart, FiTrash2, FiEdit2 } from 'react-icons/fi'
import api from '../utils/api'
import useAuth from '../hooks/useAuth'

const Tweets = () => {
  const { user } = useAuth()
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [likedTweets, setLikedTweets] = useState({})

  useEffect(() => {
    if (user) {
      fetchTweets()
    }
  }, [user])

  const fetchTweets = async () => {
    if (!user?._id) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/tweets/user/${user._id}`)
      setTweets(data?.data?.tweets || [])
    } catch (err) {
      setError('Unable to load tweets.')
    } finally {
      setLoading(false)
    }
  }

  const createTweet = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await api.post('/tweets', { content })
      setContent('')
      fetchTweets()
    } catch (err) {
      setError('Unable to create tweet.')
    } finally {
      setLoading(false)
    }
  }

  const updateTweet = async (tweetId) => {
    if (!editContent.trim()) return
    try {
      await api.patch(`/tweets/${tweetId}`, { content: editContent })
      setEditingId(null)
      setEditContent('')
      fetchTweets()
    } catch (err) {
      setError('Unable to update tweet.')
    }
  }

  const deleteTweet = async (tweetId) => {
    if (!confirm('Delete this tweet?')) return
    try {
      await api.delete(`/tweets/${tweetId}`)
      fetchTweets()
    } catch (err) {
      setError('Unable to delete tweet.')
    }
  }

  const toggleLike = async (tweetId) => {
    try {
      const currentlyLiked = likedTweets[tweetId] || false
      await api.post(`/likes/toggle/t/${tweetId}`)
      setLikedTweets((prev) => ({ ...prev, [tweetId]: !currentlyLiked }))
    } catch (err) {
      setError('Unable to like tweet.')
    }
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-white/5 bg-yt-card p-6 text-center text-yt-muted">
        Please sign in to view tweets.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Tweets</h2>

      <form onSubmit={createTweet} className="rounded-xl border border-white/5 bg-yt-card p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="h-24 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-3 rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-70"
        >
          Tweet
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading && <p className="text-sm text-yt-muted">Loading...</p>}

      <div className="space-y-3">
        {tweets.map((tweet) => (
          <div key={tweet._id} className="rounded-xl border border-white/5 bg-yt-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
                {tweet.owner?.avatar ? (
                  <img
                    src={tweet.owner.avatar}
                    alt={tweet.owner.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-yt-muted">
                    {tweet.owner?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{tweet.owner?.username}</p>
                    <p className="text-xs text-yt-muted">
                      {new Date(tweet.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {user?._id === tweet.owner?._id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(tweet._id)
                          setEditContent(tweet.content)
                        }}
                        className="rounded-lg bg-white/5 p-1 text-yt-muted transition hover:bg-white/10"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => deleteTweet(tweet._id)}
                        className="rounded-lg bg-white/5 p-1 text-red-400 transition hover:bg-white/10"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>
                {editingId === tweet._id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-white outline-none focus:border-white/30"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTweet(tweet._id)}
                        className="rounded-lg bg-yt-red px-3 py-1 text-sm text-white transition hover:bg-red-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditContent('')
                        }}
                        className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white transition hover:bg-white/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-white">{tweet.content}</p>
                )}
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(tweet._id)}
                    className={`flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs transition hover:bg-white/10 ${
                      likedTweets[tweet._id] ? 'text-yt-red' : 'text-yt-muted'
                    }`}
                  >
                    <FiHeart className={likedTweets[tweet._id] ? 'fill-current' : ''} />
                    {likedTweets[tweet._id] ? 'Liked' : 'Like'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && tweets.length === 0 && (
        <p className="text-sm text-yt-muted">No tweets yet. Create one to get started!</p>
      )}
    </div>
  )
}

export default Tweets




