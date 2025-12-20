import { Link } from 'react-router-dom'
import { FiClock } from 'react-icons/fi'

const formatViews = (views = 0) => {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`
  return views
}

const VideoCard = ({ video }) => {
  if (!video) return null
  const owner = video.owner || video.ownerDetails

  return (
    <Link
      to={`/watch/${video._id}`}
      className="group flex flex-col gap-2 overflow-hidden rounded-xl bg-yt-card shadow-yt-sm transition hover:-translate-y-0.5 hover:shadow"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
          <FiClock />
          {Math.round(video.duration || 0)}s
        </span>
      </div>
      <div className="flex gap-3 px-3 pb-4">
        <div className="mt-1 h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
          {owner?.avatar ? (
            <img src={owner.avatar} alt={owner.username} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-yt-muted">
              {owner?.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="line-clamp-2 text-sm font-semibold text-white">{video.title}</p>
          <p className="text-xs text-yt-muted">{owner?.username}</p>
          <p className="text-xs text-yt-muted">
            {formatViews(video.views)} views · {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default VideoCard




