import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import VideoPage from './pages/VideoPage'
import Channel from './pages/Channel'
import Upload from './pages/Upload'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import LikedVideos from './pages/LikedVideos'
import Playlists from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'
import Tweets from './pages/Tweets'
import Dashboard from './pages/Dashboard'

const App = () => {
  return (
    <div className="min-h-screen bg-yt-bg text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="mx-auto flex w-full max-w-8xl flex-1 flex-col px-4 py-2">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<VideoPage />} />
            <Route path="/channel/:username" element={<Channel />} />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route
              path="/liked"
              element={
                <ProtectedRoute>
                  <LikedVideos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists"
              element={
                <ProtectedRoute>
                  <Playlists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlist/:id"
              element={
                <ProtectedRoute>
                  <PlaylistDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tweets"
              element={
                <ProtectedRoute>
                  <Tweets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
