import { Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './AuthContext'
import { ProtectedRoute } from './Components/ProtectedRoute/ProtectedRoute'

import Home from './Pages/Home/Home'
import Login from './Pages/Login/Login'
import Registro from './Pages/Registro/Registro'
import Ajustes from './Pages/Ajustes/Ajustes'
import Explorar from './Pages/Explorar/Explorar'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="/explorar" element={<Explorar />} />
        {/* Protected routes 
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mis-reservas" 
          element={
            <ProtectedRoute>
              <Reservas />
            </ProtectedRoute>
          } 
        />
        */}
      </Routes>
    </AuthProvider>
  )
}

export default App