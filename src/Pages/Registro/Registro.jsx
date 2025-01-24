import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCheck, FaGoogle } from 'react-icons/fa'
import styles from './Registro.module.css'
import imglogo from '../../assets/img/logo-prin2.png'
import registerBg from '../../assets/img/img-loginbg.jpg'
import { auth, db } from '../../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'  // Add getDoc import
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../AuthContext'



const Registro = () => {

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const { signInWithGoogle } = useAuth()
    const navigate = useNavigate()
    const [message, setMessage] = useState('')

    const handleGoogleRegister = async () => {
        try {
            const result = await signInWithGoogle()
            if (result?.user) {
                // Only check users-data collection
                const userDataDoc = await getDoc(doc(db, 'users-data', result.user.email))

                if (userDataDoc.exists()) {
                    setMessage('Esta cuenta ya está registrada')
                    await auth.signOut()
                    setTimeout(() => {
                        navigate('/')
                    }, 2000)
                    return
                }

                // New user - proceed to step 2
                setFormData(prev => ({
                    ...prev,
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                    email: result.user.email || '',
                    googleAuth: true,
                    emailAuth: false,
                    uid: result.user.uid
                }))
                setStep(2)
            }
        } catch (error) {
            console.error(error)
            setMessage('Error al registrar con Google. Intenta nuevamente.')
            await auth.signOut()
        }
    }

    const initialFormData = {
        userType: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        region: '',
        phone: '',
        whatsapp: '',
        countryCode: '+51',
        whatsappCode: '+51',
        dataPolicy: false,
        newsletter: false,
        googleAuth: false,
        emailAuth: false
    }

    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState(initialFormData)

    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}

        if (!formData.googleAuth && !emailRegex.test(formData.email)) {
            newErrors.email = 'Email inválido'
        }

        if (!formData.googleAuth) {
            if (!passwordRegex.test(formData.password)) {
                newErrors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const regiones = [
        'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho',
        'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
        'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima',
        'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
        'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
    ]

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Real-time validation
        const newErrors = { ...errors }

        if (name === 'password') {
            const passwordErrors = validatePassword(value)
            if (passwordErrors.length > 0) {
                newErrors.password = passwordErrors.join(', ')
            } else {
                delete newErrors.password
            }

            // Check confirm password match
            if (formData.confirmPassword && value !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden'
            } else {
                delete newErrors.confirmPassword
            }
        }

        if (name === 'confirmPassword') {
            if (value !== formData.password) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden'
            } else {
                delete newErrors.confirmPassword
            }
        }

        if (name === 'email' && !emailRegex.test(value)) {
            newErrors.email = 'Email inválido'
        } else if (name === 'email') {
            delete newErrors.email
        }

        setErrors(newErrors)
    }

    const validatePassword = (password) => {
        const errors = []
        if (password.length < 8) errors.push('Mínimo 8 caracteres')
        if (!/[A-Z]/.test(password)) errors.push('Al menos una mayúscula')
        if (!/[a-z]/.test(password)) errors.push('Al menos una minúscula')
        if (!/\d/.test(password)) errors.push('Al menos un número')
        return errors
    }

    

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            let userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                region: formData.region,
                phone: formData.phone,
                whatsapp: formData.whatsapp,
                countryCode: formData.countryCode,
                whatsappCode: formData.whatsappCode,
                userType: formData.userType,
                createdAt: new Date(),
                authProvider: formData.googleAuth ? 'google' : 'email',
                dataPolicy: formData.dataPolicy,
                newsletter: formData.newsletter
            }

            if (formData.googleAuth) {
                userData.uid = formData.uid
            } else {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                )
                userData.uid = userCredential.user.uid
            }

            // Store only in users-data collection
            await setDoc(doc(db, 'users-data', formData.email), userData)

            setMessage('Registro completado exitosamente')
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error) {
            console.error(error)
            setMessage('Error al completar el registro')
            if (!formData.googleAuth) {
                await auth.signOut()
            }
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className={styles.stepContent}>
                        <h3>Elige cómo quieres registrarte</h3>

                        <button
                            className={styles.googleButton}
                            onClick={handleGoogleRegister}
                        >
                            <FaGoogle />
                            <span>Registrarse con Google</span>
                        </button>

                        <div className={styles.divider}>
                            <span>o</span>
                        </div>

                        <button
                            className={styles.emailButton}
                            onClick={() => {
                                setFormData(prev => ({ ...prev, emailAuth: true }));
                                setStep(2);
                            }}
                        >
                            Registrarse con otro correo
                        </button>
                    </div>
                )

            case 2:
                return (
                    <div className={styles.stepContent}>
                        <h3>Información personal</h3>
                        <div className={styles.containerform}>


                            <div className={styles.formGroup}>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Nombre"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Apellido"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={formData.googleAuth}
                                    className={formData.googleAuth ? styles.disabledInput : ''}
                                />
                                <select
                                    name="region"
                                    value={formData.region}
                                    onChange={handleInputChange}
                                    className={styles.select}
                                >
                                    <option value="">Selecciona tu región</option>
                                    {regiones.map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>

                                <div className={styles.phoneInput}>
                                    <input
                                        type="text"
                                        name="countryCode"
                                        value={formData.countryCode}
                                        onChange={handleInputChange}
                                        className={styles.countryCode}
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Teléfono"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className={styles.phoneInput}>
                                    <input
                                        type="text"
                                        name="whatsappCode"
                                        value={formData.whatsappCode}
                                        onChange={handleInputChange}
                                        className={styles.countryCode}
                                    />
                                    <input
                                        type="tel"
                                        name="whatsapp"
                                        placeholder="WhatsApp"
                                        value={formData.whatsapp}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {!formData.googleAuth && formData.emailAuth && (
                                    <>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Contraseña"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        {errors.password && (
                                            <span className={styles.error}>{errors.password}</span>
                                        )}
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirmar contraseña"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                        />
                                        {errors.confirmPassword && (
                                            <span className={styles.error}>{errors.confirmPassword}</span>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        name="dataPolicy"
                                        checked={formData.dataPolicy}
                                        onChange={handleInputChange}
                                    />
                                    <span>He leído y acepto las condiciones de tratamiento de datos</span>
                                </label>
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        name="newsletter"
                                        checked={formData.newsletter}
                                        onChange={handleInputChange}
                                    />
                                    <span>Deseo recibir noticias y ofertas por correo</span>
                                </label>
                            </div>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.backButton}
                                onClick={() => {
                                    setStep(1)
                                    setFormData(initialFormData)
                                    setErrors({})
                                }}
                            >
                                Anterior
                            </button>
                            <button
                                className={styles.nextButton}
                                onClick={() => setStep(3)}
                                disabled={
                                    !formData.firstName ||
                                    !formData.lastName ||
                                    !formData.region ||
                                    !formData.phone ||
                                    !formData.dataPolicy ||
                                    (formData.emailAuth && (
                                        !formData.password ||
                                        !formData.confirmPassword ||
                                        Object.keys(errors).length > 0
                                    ))
                                }
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className={styles.stepContent}>
                        <h3>¿Qué te describe mejor?</h3>
                        <div className={styles.optionsGrid}>
                            <label className={styles.optionCard}>
                                <input
                                    type="radio"
                                    name="userType"
                                    value="renter"
                                    checked={formData.userType === 'renter'}
                                    onChange={handleInputChange}
                                />
                                <span>Busco alquilar una cancha</span>
                            </label>
                            <label className={styles.optionCard}>
                                <input
                                    type="radio"
                                    name="userType"
                                    value="offfer"
                                    checked={formData.userType === 'offfer'}
                                    onChange={handleInputChange}
                                />
                                <span>Soy dueño y busco ofrecer mi cancha</span>
                            </label>
                            <label className={styles.optionCard}>
                                <input
                                    type="radio"
                                    name="userType"
                                    value="Both"
                                    checked={formData.userType === 'Both'}
                                    onChange={handleInputChange}
                                />
                                <span>Ambos</span>
                            </label>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button className={styles.backButton} onClick={() => setStep(2)}>
                                Anterior
                            </button>
                            <button
                                className={styles.submitButton}
                                onClick={handleSubmit}
                                disabled={!formData.userType}
                            >
                                Completar registro
                            </button>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className={styles.registerContainer}>
            <Link to="/" className={styles.backButton}>
                <FaArrowLeft />
            </Link>

            <div className={styles.formSection}>
                <div className={styles.formWrapper}>
                    {message && (
                        <div className={styles.messageAlert}>
                            {message}
                        </div>
                    )}
                    <div className={styles.progressBar}>
                        {[1, 2, 3].map(num => (
                            <div
                                key={num}
                                className={`${styles.progressStep} ${step >= num ? styles.active : ''}`}
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                    {renderStep()}
                </div>
            </div>

            <div className={styles.imageSection}>
                <img src={imglogo} alt="Logo" className={styles.logo} />
                <h1>Descubre la app de reserva de canchas líder en Perú</h1>
                <div className={styles.overlay}></div>
                <img src={registerBg} alt="Background" className={styles.bgImage} />
            </div>
        </div>
    )
}

export default Registro