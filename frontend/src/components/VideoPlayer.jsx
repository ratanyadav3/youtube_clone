const VideoPlayer = ({ src, poster }) => {
  if (!src) return null

  return (
    <video
      className="aspect-video w-full rounded-xl bg-black"
      src={src}
      poster={poster}
      controls
      preload="metadata"
    />
  )
}

export default VideoPlayer




