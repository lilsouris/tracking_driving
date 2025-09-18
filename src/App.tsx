import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Suspense, lazy } from 'react'
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TrajetsList = lazy(() => import('./pages/TrajetsList'))
const AddTrajet = lazy(() => import('./pages/AddTrajet'))
const MapView = lazy(() => import('./pages/MapView'))
const Login = lazy(() => import('./pages/Login'))
const Profile = lazy(() => import('./pages/Profile'))
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Suspense fallback={<div className="p-6 text-center text-gray-600">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/trajets" element={<TrajetsList />} />
              <Route path="/add-trajet" element={<AddTrajet />} />
              <Route path="/map/:id" element={<MapView />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
