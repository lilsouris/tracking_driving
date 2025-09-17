import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import TrajetsList from './pages/TrajetsList'
import AddTrajet from './pages/AddTrajet'
import MapView from './pages/MapView'
import Login from './pages/Login'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/trajets" element={<TrajetsList />} />
            <Route path="/add-trajet" element={<AddTrajet />} />
            <Route path="/map/:id" element={<MapView />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
