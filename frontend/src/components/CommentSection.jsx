import { useEffect, useState } from 'react'
import { FiHeart, FiTrash2 } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'
import api from '../utils/api'

const CommentSection = ({ videoId }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // nested comments state
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [repliesByComment, setRepliesByComment] = useState({})
  const [openThreads, setOpenThreads] = useState({})
  const [repliesLoading, setRepliesLoading] = useState({})
  const [likedComments, setLikedComments] = useState({})

  const fetchComments = async () => {
    if (!videoId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/comments/${videoId}`)
      const commentsArray = data?.data?.comments || data?.data || []
      setComments(Array.isArray(commentsArray) ? commentsArray : [])
    } catch (err) {
      setError('Unable to load comments')
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async (commentId) => {
    if (!commentId) return
    setRepliesLoading((prev) => ({ ...prev, [commentId]: true }))
    try {
      const { data } = await api.get(`/comments/replies/${commentId}`)
      const replies = data?.data || []
      setRepliesByComment((prev) => ({ ...prev, [commentId]: replies }))
    } catch (err) {
      setError('Unable to load replies')
    } finally {
      setRepliesLoading((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  useEffect(() => {
    if (user) {
      fetchComments()
    }
  }, [videoId, user])

  const addComment = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      const { data } = await api.post(`/comments/${videoId}`, { content: text })
      setComments((prev) => [data?.data, ...prev])
      setText('')
    } catch (err) {
      setError('Unable to post comment')
    }
  }

  const addReply = async (e, parentId) => {
    e.preventDefault()
    if (!replyText.trim() || !parentId) return
    try {
      const { data } = await api.post(`/comments/replies/${parentId}`, { content: replyText })
      const newReply = data?.data
      setRepliesByComment((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), newReply],
      }))
      setReplyText('')
      setReplyingTo(null)
      setOpenThreads((prev) => ({ ...prev, [parentId]: true }))
    } catch (err) {
      setError('Unable to post reply')
    }
  }

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/c/${commentId}`)
      setComments((prev) => prev.filter((c) => c._id !== commentId))
    } catch (err) {
      setError('Unable to delete comment')
    }
  }

  const toggleLike = async (commentId) => {
    try {
      const currentlyLiked = likedComments[commentId] || false
      await api.post(`/likes/toggle/c/${commentId}`)
      setLikedComments((prev) => ({ ...prev, [commentId]: !currentlyLiked }))
    } catch (err) {
      setError('Unable to like comment')
    }
  }

  const handleToggleReplies = async (commentId) => {
    const isOpen = openThreads[commentId]
    if (!isOpen && !repliesByComment[commentId]) {
      await fetchReplies(commentId)
    }
    setOpenThreads((prev) => ({ ...prev, [commentId]: !isOpen }))
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-white/5 bg-yt-card p-4 text-sm text-yt-muted">
        Login to view and add comments.
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/5 bg-yt-card p-4">
      <h3 className="text-lg font-semibold text-white">Comments</h3>

      <form onSubmit={addComment} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="h-20 w-full rounded-lg border border-white/10 bg-yt-surface px-3 py-2 text-sm text-white outline-none focus:border-white/30"
        />
        <button
          type="submit"
          className="rounded-lg bg-yt-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          Comment
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="text-sm text-yt-muted">Loading comments...</p>
      ) : (
        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-sm text-yt-muted">No comments yet.</p>
          )}
          {comments.map((comment) => {
            const isOpen = openThreads[comment._id]
            const replies = repliesByComment[comment._id] || []
            const isRepliesLoading = repliesLoading[comment._id]

            return (
              <div key={comment._id} className="space-y-2 rounded-lg border border-white/5 bg-yt-surface p-3">
                <div className="flex items-center justify-between text-sm text-yt-muted">
                  <span className="font-semibold text-white">{comment.owner?.username}</span>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-white">{comment.content}</p>
                <div className="mt-2 flex items-center gap-3 text-sm text-yt-muted">
                  <button
                    type="button"
                    onClick={() => toggleLike(comment._id)}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 transition hover:bg-white/10 ${
                      likedComments[comment._id] ? 'text-yt-red' : ''
                    }`}
                  >
                    <FiHeart className={likedComments[comment._id] ? 'fill-current' : ''} />
                    {likedComments[comment._id] ? 'Liked' : 'Like'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(comment._id)}
                    className="rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wide text-white/80 transition hover:bg-white/10"
                  >
                    Reply
                  </button>
                  {(replies.length > 0 || isOpen) && (
                    <button
                      type="button"
                      onClick={() => handleToggleReplies(comment._id)}
                      className="text-xs font-medium text-yt-muted hover:text-white"
                    >
                      {isOpen ? 'Hide replies' : `View ${replies.length || ''} replies`}
                    </button>
                  )}
                </div>

                {replyingTo === comment._id && (
                  <form
                    onSubmit={(e) => addReply(e, comment._id)}
                    className="mt-2 flex gap-2 pl-10 text-sm"
                  >
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Reply..."
                      className="h-16 flex-1 rounded-lg border border-white/10 bg-yt-bg px-3 py-2 text-white outline-none focus:border-white/30"
                    />
                    <button
                      type="submit"
                      className="self-end rounded-lg bg-yt-red px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                    >
                      Reply
                    </button>
                  </form>
                )}

                {isOpen && (
                  <div className="mt-2 space-y-2 border-l border-white/10 pl-6">
                    {isRepliesLoading && (
                      <p className="text-xs text-yt-muted">Loading replies...</p>
                    )}
                    {!isRepliesLoading && replies.length === 0 && (
                      <p className="text-xs text-yt-muted">No replies yet.</p>
                    )}
                    {replies.map((reply) => (
                      <div key={reply._id} className="space-y-1 text-sm">
                        <div className="flex items-center justify-between text-xs text-yt-muted">
                          <span className="font-semibold text-white">{reply.owner?.username}</span>
                          <span>{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-white">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CommentSection




