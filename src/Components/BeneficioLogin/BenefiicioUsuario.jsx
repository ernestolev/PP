import React from 'react'
import { Link } from 'react-router-dom'
import { FaTimes, FaHeart, FaHistory, FaCalendarAlt, FaStar } from 'react-icons/fa'
import styles from './BeneficioUsuario.module.css'


import alertlogin from '../../assets/img/img-alertlogin.png'

const BenefiicioUsuario = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes />
                </button>
                
                <div className={styles.modalContent}>
                    <div className={styles.leftSection}>
                        <img src={alertlogin} alt="Beneficios de registro" />
                    </div>
                    
                    <div className={styles.rightSection}>
                        <h2>¡Crea tu cuenta gratis!</h2>
                        <p className={styles.subtitle}>
                            Disfruta de todos los beneficios que tenemos para ti
                        </p>

                        <div className={styles.benefitsList}>
                            <div className={styles.benefitItem}>
                                <FaHeart />
                                <span>Guarda tus canchas favoritas</span>
                            </div>
                            <div className={styles.benefitItem}>
                                <FaHistory />
                                <span>Accede a tu historial de reservas</span>
                            </div>
                            <div className={styles.benefitItem}>
                                <FaCalendarAlt />
                                <span>Gestiona tus reservas fácilmente</span>
                            </div>
                            <div className={styles.benefitItem}>
                                <FaStar />
                                <span>Califica y comenta las canchas</span>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <Link to="/register" className={styles.registerButton}>
                                Crear cuenta
                            </Link>
                            <Link to="/login" className={styles.loginButton}>
                                Iniciar sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.overlay} onClick={onClose} />
        </>
    )
}

export default BenefiicioUsuario