import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { FiHome, FiUpload, FiHeart, FiList, FiMessageSquare } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'
import api from '../utils/api'

const navClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10 ${
    isActive ? 'bg-white/10 text-white' : 'text-yt-muted'
  }`

const Sidebar = () => {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Listen for header dropdown toggles
  useEffect(() => {
    const handler = () => setMobileOpen((prev) => !prev)
    window.addEventListener('toggle-sidebar', handler)
    return () => window.removeEventListener('toggle-sidebar', handler)
  }, [])
  const [subscriptions, setSubscriptions] = useState([])
  const [subError, setSubError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return
      try {
        setSubError(null)
        setSubsError(null)

        // Channels I am subscribed to
        const { data: subsData } = await api.get(`/subscriptions/c/${user._id}`)
        const subs = subsData?.data?.subscriptions || []
        setSubscriptions(subs)

      } catch (err) {
        // differentiate errors roughly
        if (!subscriptions.length) setSubError('Unable to load subscriptions')
        if (!subscribers.length) setSubsError('Unable to load subscribers')
      }
    }

    fetchData()
  }, [user])

  const baseClasses =
    'fixed md:sticky top-16 left-0 z-10 h-[calc(100vh-64px)] w-full sm:w-72 lg:w-60 flex-col gap-1 border-r border-white/8 bg-yt-bg/90 p-3 text-white backdrop-blur'
  const visibilityClasses = mobileOpen ? 'flex md:flex' : 'hidden md:flex'

  return (
    <aside className={`${baseClasses} ${visibilityClasses}`}>
      <NavLink className={navClasses} to="/">
        <FiHome />
        Home
      </NavLink>
      {user && (
        <>
          <NavLink className={navClasses} to="/liked">
            <FiHeart />
            Liked Videos
          </NavLink>
          <NavLink className={navClasses} to="/playlists">
            <FiList />
            Playlists
          </NavLink>
          <NavLink className={navClasses} to="/tweets">
            <FiMessageSquare />
            Tweets
          </NavLink>
          <NavLink className={navClasses} to="/upload">
            <FiUpload />
            Upload
          </NavLink>

          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-yt-muted">
              Subscriptions
            </p>
            {subError && <p className="px-2 text-[11px] text-red-400">{subError}</p>}
            <div className="flex flex-col gap-1">
              {subscriptions.map((sub) => (
                <Link
                  key={sub._id}
                  to={`/channel/${sub.channel?.username}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-yt-muted transition hover:bg-white/10 hover:text-white"
                >
                  <div className="h-7 w-7 overflow-hidden rounded-full bg-white/10">
                    {sub.channel?.avatar ? (
                      <img
                        src={sub.channel.avatar}
                        alt={sub.channel.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-yt-muted">
                        {sub.channel?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="truncate text-xs text-white">{sub.channel?.username}</p>
                    <p className="truncate text-[10px] text-yt-muted">
                      {sub.channel?.subscribersCount || 0} subscribers
                    </p>
                  </div>
                </Link>
              ))}
              {subscriptions.length === 0 && !subError && (
                <p className="px-2 text-[11px] text-yt-muted">No subscriptions yet.</p>
              )}
            </div>

          </div>
        </>
      )}
    </aside>
  )
}

export default Sidebar




