import React from 'react'
import { Link } from 'react-router-dom'
import { FaTimes, FaSearch } from 'react-icons/fa'
import { MdKeyboardArrowDown } from 'react-icons/md'
import styles from './MobileMenu.module.css'
import PropTypes from 'prop-types'
import { useAuth } from '../../AuthContext'
import imglogo from '../../assets/img/logo-prin2.png'


const MobileMenu = ({ isOpen, onClose, onSearch }) => {
    const [isRentOpen, setIsRentOpen] = React.useState(false)
    const [isOfferOpen, setIsOfferOpen] = React.useState(false)
    const { user, userData, logout } = useAuth()

    if (!isOpen) return null

    return (
        <div className={styles.menuOverlay}>
            <div className={`${styles.menuContent} ${isOpen ? styles.open : ''}`}>
                <div className={styles.menuHeader}>
                    <img src={imglogo} alt="Logo" className={styles.logo} />
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.menuBody}>
                    {user ? (
                        <div className={styles.userSection}>
                            <div className={styles.userInfo}>
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}`}
                                    alt="Profile"
                                    className={styles.userAvatar}
                                />
                                <div>
                                    <p>Bienvenido</p>
                                    <h4>{userData?.displayName}</h4>
                                </div>
                            </div>
                            <button className={styles.logoutButton} onClick={logout}>
                                Cerrar sesión
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <Link to="/login" className={styles.loginButton}>
                                Iniciar sesión
                            </Link>
                            <Link to="/registro" className={styles.registerButton}>
                                Registrarse
                            </Link>
                        </div>
                    )}

                    <button className={styles.searchButton} onClick={onSearch}>
                        <FaSearch />
                        <span>Buscar</span>
                    </button>

                    <div className={styles.menuSection}>
                        <button
                            className={styles.menuToggle}
                            onClick={() => setIsRentOpen(!isRentOpen)}
                        >
                            <span>Alquilar</span>
                            <MdKeyboardArrowDown />
                        </button>
                        {isRentOpen && (
                            <div className={styles.submenu}>
                                <Link to="/canchas">Ver todas las canchas</Link>
                                <Link to="/canchas/chincha">Canchas en Chincha Alta</Link>
                                <Link to="/guia">Guía de alquiler</Link>
                                <Link to="/puntos">Puntos PP</Link>
                            </div>
                        )}
                    </div>

                    <div className={styles.menuSection}>
                        <button
                            className={styles.menuToggle}
                            onClick={() => setIsOfferOpen(!isOfferOpen)}
                        >
                            <span>Ofrecer</span>
                            <MdKeyboardArrowDown />
                        </button>
                        {isOfferOpen && (
                            <div className={styles.submenu}>
                                <Link to="/publicar">Publicar cancha</Link>
                                <Link to="/dashboard">Panel de control</Link>
                                <Link to="/guia-propietarios">Guía para propietarios</Link>
                                <Link to="/estadisticas">Estadísticas</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

MobileMenu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired
}

export default MobileMenu