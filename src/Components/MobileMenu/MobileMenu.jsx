import React from 'react'
import { Link } from 'react-router-dom'
import { FaTimes, FaSearch, FaUser, FaClipboard, FaHeart, FaHistory, FaMoon, FaSun, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa'
import { MdKeyboardArrowDown } from 'react-icons/md'
import styles from './MobileMenu.module.css'
import PropTypes from 'prop-types'
import { useAuth } from '../../AuthContext'
import imglogo from '../../assets/img/logo-prin2.png'


const MobileMenu = ({ isOpen, onClose, onSearch }) => {
    const [isRentOpen, setIsRentOpen] = React.useState(false)
    const [isOfferOpen, setIsOfferOpen] = React.useState(false)
    const { user, userData, logout } = useAuth()
    const [isDarkMode, setIsDarkMode] = React.useState(false)

    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false)

    if (!isOpen) return null


    const handleLogout = async () => {
        try {
            await logout()
            onClose()
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

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
                            <div
                                className={styles.userInfo}
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            >
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}`}
                                    alt="Profile"
                                    className={styles.userAvatar}
                                />
                                <div className={styles.userDetails}>
                                    <p>Bienvenido</p>
                                    <div className={styles.userName}>
                                        <h4>{userData?.displayName}</h4>
                                        <MdKeyboardArrowDown className={`${styles.arrow} ${isProfileMenuOpen ? styles.arrowUp : ''}`} />
                                    </div>
                                </div>
                            </div>

                            {isProfileMenuOpen && (
                                <div className={styles.profileMenu}>
                                    <Link to="/ajustes" className={styles.profileMenuItem}>
                                        <FaUser />
                                        <span>Mi cuenta</span>
                                    </Link>
                                    <Link to="/MisCanchas" className={styles.profileMenuItem}>
                                        <FaClipboard />
                                        <span>Mis anuncios</span>
                                    </Link>
                                    <Link to="/Favoritos" className={styles.profileMenuItem}>
                                        <FaHeart />
                                        <span>Favoritos</span>
                                    </Link>
                                    <Link to="/VistosRecientemente" className={styles.profileMenuItem}>
                                        <FaHistory />
                                        <span>Vistos recientemente</span>
                                    </Link>
                                    <div className={`${styles.profileMenuItem} ${styles.darkModeToggle}`}>
                                        {isDarkMode ? <FaSun /> : <FaMoon />}
                                        <span>Modo oscuro</span>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={isDarkMode}
                                                onChange={() => setIsDarkMode(!isDarkMode)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                    <Link to="/ayuda" className={styles.profileMenuItem}>
                                        <FaQuestionCircle />
                                        <span>Ayuda</span>
                                    </Link>
                                </div>
                            )}
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
                {user && (
                    <>
                        <div className={styles.logoutSection}>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                <FaSignOutAlt />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </>
                )}
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