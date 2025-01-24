import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle, FaArrowLeft } from 'react-icons/fa'
import styles from './Login.module.css'
import imglogo from '../../assets/img/logo-prin2.png'
import loginBg from '../../assets/img/img-loginbg.jpg'
import { useState } from 'react'
import { useAuth } from '../../AuthContext'
import { auth, db } from '../../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'




const Login = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const { signInWithGoogle } = useAuth()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState({})
    const navigate = useNavigate()


    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle()
            if (result?.user) {
                const userDataDoc = await getDoc(doc(db, 'users-data', result.user.email))
                
                if (!userDataDoc.exists()) {
                    await signOut(auth)
                    setMessage('Por favor, completa tu registro primero')
                    setTimeout(() => {
                        navigate('/registro')
                    }, 2000)
                    return
                }
                navigate('/')
            }
        } catch (error) {
            console.error(error)
            setMessage('Error al iniciar sesión con Google')
            await signOut(auth)
        }
    }


    const handleEmailLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // First verify if user exists in users-data
            const userDataDoc = await getDoc(doc(db, 'users-data', formData.email))
            
            if (!userDataDoc.exists()) {
                setErrors({ auth: 'Usuario no registrado' })
                setLoading(false)
                return
            }

            await signInWithEmailAndPassword(auth, formData.email, formData.password)
            navigate('/')
        } catch (error) {
            setErrors({ auth: 'Credenciales inválidas' })
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className={styles.loginContainer}>
            <Link to="/" className={styles.backButton}>
                <FaArrowLeft />
            </Link>
            <div className={styles.formSection}>
                <div className={styles.formWrapper}>
                    <h2>Bienvenido de nuevo</h2>

                    <button
                        className={styles.googleButton}
                        onClick={handleGoogleSignIn}
                    >
                        <FaGoogle />
                        <span>Continuar con Google</span>
                    </button>


                    <div className={styles.divider}>
                        <span>o</span>
                    </div>

                    <form onSubmit={handleEmailLogin}>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Correo electrónico"
                            className={styles.emailInput}
                        />
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Contraseña"
                            className={styles.passwordInput}
                        />
                        <button
                            className={styles.accessButton}
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                        {errors.auth && (
                            <p className={styles.error}>{errors.auth}</p>
                        )}
                    </form>

                    {message && (
                        <p className={styles.message}>{message}</p>
                    )}





                    <p className={styles.registerLink}>
                        ¿Necesitas una cuenta? {' '}
                        <Link to="/register">Regístrate acá</Link>
                    </p>
                </div>
            </div>

            <div className={styles.imageSection}>
                <img src={imglogo} alt="Logo" className={styles.logo} />
                <h1>Descubre la app de reserva de canchas líder en Perú</h1>
                <div className={styles.overlay}></div>
                <img src={loginBg} alt="Background" className={styles.bgImage} />
            </div>
        </div>
    )
}

export default Login