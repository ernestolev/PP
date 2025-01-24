import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './AuthContext'
import { ProtectedRoute } from '../src/Components/ProtectedRoute/ProtectedRoute'

import Home from '../src/Pages/Home/Home'
import Login from '../src/Pages/Login/Login'
import Registro from '../src/Pages/Registro/Registro'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />


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
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App