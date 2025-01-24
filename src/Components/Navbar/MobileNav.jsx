import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaSearch, FaUser, FaBars } from 'react-icons/fa'
import PropTypes from 'prop-types'
import styles from './MobileNav.module.css'
import MobileMenu from '../MobileMenu/MobileMenu'

const MobileNav = ({ onSearch }) => {
    const handleSearchClick = (e) => {
        e.preventDefault()
        onSearch()
    }

    const [isMenuOpen, setIsMenuOpen] = useState(false)


    return (
        <>
            <nav className={styles.mobileNav}>
                <Link to="/">
                    <FaHome />
                    <span>Inicio</span>
                </Link>
                <button className={styles.searchLink} onClick={handleSearchClick}>
                    <FaSearch />
                    <span>Buscar</span>
                </button>
                <Link to="/login">
                    <FaUser />
                    <span>Ingresar</span>
                </Link>
                <button onClick={() => setIsMenuOpen(true)}>
                    <FaBars />
                    <span>Menú</span>
                </button>
            </nav>
            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onSearch={onSearch}
            />
        </>
    )
}

MobileNav.propTypes = {
    onSearch: PropTypes.func.isRequired
}

export default MobileNav