import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'
import { FaGlobe, FaSearch, FaUser, FaMoon, FaSun, FaHistory, FaQuestionCircle } from 'react-icons/fa'
import { MdKeyboardArrowDown } from 'react-icons/md'

import imglogo from '../../assets/img/logo-prin2.png'

const Navbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isRentMenuOpen, setIsRentMenuOpen] = useState(false)
  const [isOfferMenuOpen, setIsOfferMenuOpen] = useState(false)

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
              <div className={styles.dropdownContent}>
              </div>
            )}
          </div>

          <div className={styles.dropdown}>
            <button onClick={() => setIsOfferMenuOpen(!isOfferMenuOpen)}>
              Ofrecer <MdKeyboardArrowDown />
            </button>
            {isOfferMenuOpen && (
              <div className={styles.dropdownContent}>
              </div>
            )}
          </div>

          <div className={styles.dropdown}>
            <button onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}>
              <FaGlobe />
            </button>
            {isLanguageMenuOpen && (
              <div className={styles.dropdownContent}>
                <button>English</button>
                <button>Español</button>
              </div>
            )}
          </div>

          <button className={styles.searchButton}>
            <FaSearch />
          </button>

          <div className={styles.dropdown}>
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
              <FaUser />
            </button>
            {isUserMenuOpen && (
              <div className={styles.dropdownContent}>
                <button>Iniciar sesión</button>
                <button>Registrarse</button>
                <hr />
                <button><FaHistory /> Vistos recientemente</button>
                <button onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <FaSun /> : <FaMoon />} 
                  {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
                </button>
                <button><FaQuestionCircle /> Ayuda</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar