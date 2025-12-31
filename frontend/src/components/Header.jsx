import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiLogIn,
  FiLogOut,
  FiSearch,
  FiUpload,
  FiUser,
  FiBarChart2,
  FiArrowLeft,
  FiMenu,
} from 'react-icons/fi'
import useAuth from '../hooks/useAuth'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const [query, setQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const profileMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    setMobileSearchOpen(false)
  }

  const showUpload = user && location.pathname !== '/upload'

  /* ================= MOBILE SEARCH OVERLAY ================= */
  if (mobileSearchOpen) {
    return (
      <header className="sticky top-0 z-20 border-b border-white/8 bg-yt-bg/90 px-3 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <FiArrowLeft />
          </button>

          <form
            onSubmit={onSearch}
            className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-yt-card px-3 py-2 text-sm"
          >
            <FiSearch className="text-yt-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              autoFocus
              className="w-full bg-transparent text-white outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/20"
            >
              Search
            </button>
          </form>
        </div>
      </header>
    )
  }

  /* ================= NORMAL HEADER ================= */
  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-yt-bg/90 px-3 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-6xl justi gap-3">
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-2">
          {user && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white sm:hidden"
            >
              <FiMenu />
            </button>
          )}
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer text-lg font-semibold text-white"
          >
            <span className="rounded bg-yt-red px-2 py-1 text-black">YT</span> Clone
          </div>
        </div>

        {/* Search */}
        <form
          onSubmit={onSearch}
          className="hidden flex-1 items-center gap-2 rounded-full border border-white/10 bg-yt-card px-3 py-2 text-sm sm:flex"
        >
          <FiSearch className="text-yt-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-white outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/20"
          >
            Search
          </button>
        </form>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Mobile search icon */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white sm:hidden"
            type="button"
          >
            <FiSearch />
          </button>

          {/* Mobile upload icon */}
          {showUpload && (
            <button
              onClick={() => navigate('/upload')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white sm:hidden"
              type="button"
            >
              <FiUpload />
            </button>
          )}

          {/* Desktop upload button */}
          {showUpload && (
            <button
              onClick={() => navigate('/upload')}
              className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20 sm:flex"
            >
              <FiUpload /> Upload
            </button>
          )}

          {user ? (
            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-white hover:bg-white/10"
              >
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.username}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-yt-card">
                  <Link
                    to={`/channel/${user.username}`}
                    className="block px-4 py-2 hover:bg-white/10"
                  >
                    <FiUser className="inline mr-2" />
                    My Channel
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 hover:bg-white/10"
                  >
                    <FiBarChart2 className="inline mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-white/10"
                  >
                    <FiLogOut className="inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-full bg-yt-red px-4 py-2 text-white"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-white/10 px-3 py-2 text-white"
              >
                <FiLogIn />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
