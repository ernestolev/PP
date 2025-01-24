import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'
import { FaUser, FaClipboard, FaHeart, FaHistory, FaMoon, FaSun, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { useAuth } from '../../AuthContext'
import { FaSearch, FaGlobe } from 'react-icons/fa'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'


import banneralq from '../../assets/img/img-Balquilar.png'
import bannerrent from '../../assets/img/img-Brentar.png'
import imglogo from '../../assets/img/logo-prin2.png'

const Navbar = ({ onSearch }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isRentMenuOpen, setIsRentMenuOpen] = useState(false)
    const [isOfferMenuOpen, setIsOfferMenuOpen] = useState(false)
    const { user, userData, logout } = useAuth()
    const [userInfo, setUserInfo] = useState(null)

    const [isSearchOpen, setIsSearchOpen] = useState(false)
    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.email) {
                const docRef = doc(db, 'users-data', user.email)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setUserInfo(docSnap.data())
                }
            }
        }
        fetchUserData()
    }, [user])


    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <Link to="/" className={styles.logo}>
                    <img src={imglogo} alt="Logo" />
                </Link>

                <div className={styles.rightNav}>
                    <div className={styles.dropdown}>
                        <button onClick={() => setIsRentMenuOpen(!isRentMenuOpen)}>
                            Alquilar <MdKeyboardArrowDown />
                        </button>
                        {isRentMenuOpen && (
                            <div className={styles.megaMenu}>
                                <div className={styles.megaMenuContent}>
                                    <div className={styles.menuColumn}>
                                        <h4>Descubre canchas</h4>
                                        <Link to="/canchas">Ver todas las canchas disponibles</Link>
                                        <Link to="/canchas/chincha">Ver canchas disponibles en Chincha Alta</Link>
                                    </div>
                                    <div className={styles.menuColumn}>
                                        <h4>Recursos</h4>
                                        <Link to="/guia">Guía de alquilar canchas</Link>
                                        <Link to="/puntos">Puntos PP</Link>
                                    </div>
                                    <div className={`${styles.menuColumn} ${styles.featuredColumn}`}>
                                        <div className={styles.featuredImage} style={{ backgroundImage: `url("${banneralq}")` }}>
                                            <h3>Comparte tu reserva</h3>
                                            <p>Invita a tus amigos y comparte los datos de tu reserva</p>
                                            <button>Ver más</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.dropdown}>
                        <button onClick={() => setIsOfferMenuOpen(!isOfferMenuOpen)}>
                            Ofrecer <MdKeyboardArrowDown />
                        </button>
                        {isOfferMenuOpen && (
                            <div className={styles.megaMenu}>
                                <div className={styles.megaMenuContent}>
                                    <div className={styles.menuColumn}>
                                        <h4>Gestiona tu cancha</h4>
                                        <Link to="/publicar">Publicar cancha</Link>
                                        <Link to="/dashboard">Panel de control</Link>
                                    </div>
                                    <div className={styles.menuColumn}>
                                        <h4>Recursos para dueños</h4>
                                        <Link to="/guia-propietarios">Guía para propietarios</Link>
                                        <Link to="/estadisticas">Estadísticas y reportes</Link>
                                    </div>
                                    <div className={`${styles.menuColumn} ${styles.featuredColumn}`}>
                                        <div className={styles.featuredImage} style={{ backgroundImage: `url("${bannerrent}")` }}>
                                            <h3>Maximiza tus ingresos</h3>
                                            <p>Gestiona reservas y aumenta la visibilidad de tu cancha</p>
                                            <button>Empezar ahora</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className={styles.searchButton}
                        onClick={() => {
                            setIsSearchOpen(!isSearchOpen)
                            onSearch()
                        }}
                    >
                        <FaSearch />
                        <span>Buscar</span>
                    </button>

                    <div className={styles.dropdown}>
                        <button onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}>
                            <FaGlobe />
                            <span>ES</span>
                            <MdKeyboardArrowDown />
                        </button>
                        {isLanguageMenuOpen && (
                            <div className={styles.dropdownContent}>
                                <button className={styles.menuItem}>
                                    Español
                                </button>
                                <button className={styles.menuItem}>
                                    English
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.dropdown}>
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                            {user ? (
                                <div className={styles.userInfo}>
                                    <img
                                        src={user.photoURL || `https://ui-avatars.com/api/?name=${userInfo?.firstName}`}
                                        alt="Profile"
                                        className={styles.userAvatar}
                                    />
                                    <span>{userInfo?.firstName} {userInfo?.lastName}</span> 
                                </div>
                            ) : (
                                <FaUser />
                            )}
                        </button>
                        {isUserMenuOpen && (
                            <div className={styles.dropdownContent}>
                                {user ? (
                                    <>
                                        <div className={styles.welcomeSection}>
                                            <p>Bienvenido</p>
                                            <h4>{userInfo?.firstName} {userInfo?.lastName}</h4>
                                        </div>
                                        <div className={styles.menuSection}>
                                            <Link to="/Ajustes" className={styles.menuItem}>
                                                <FaUser />
                                                <span>Mi cuenta</span>
                                            </Link>
                                            <Link to="/mis-anuncios" className={styles.menuItem}>
                                                <FaClipboard />
                                                <span>Mis anuncios</span>
                                            </Link>
                                            <Link to="/favoritos" className={styles.menuItem}>
                                                <FaHeart />
                                                <span>Favoritos</span>
                                            </Link>
                                            <Link to="/recientes" className={styles.menuItem}>
                                                <FaHistory />
                                                <span>Vistos recientemente</span>
                                            </Link>
                                        </div>
                                        <div className={styles.menuSection}>
                                            <div className={`${styles.menuItem} ${styles.darkModeToggle}`}>
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
                                            <Link to="/ayuda" className={styles.menuItem}>
                                                <FaQuestionCircle />
                                                <span>Ayuda</span>
                                            </Link>
                                            <button className={styles.menuItem} onClick={logout}>
                                                <FaSignOutAlt />
                                                <span>Cerrar sesión</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (

                                    <div className={styles.menuSection}>
                                        <button className={styles.menuItem} onClick={() => setIsDarkMode(!isDarkMode)}>
                                            {isDarkMode ? <FaSun /> : <FaMoon />}
                                            <span>{isDarkMode ? 'Modo claro' : 'Modo oscuro'}</span>
                                        </button>
                                        <button className={styles.menuItem}>
                                            <FaQuestionCircle />
                                            <span>Ayuda</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar