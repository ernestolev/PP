import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaSearch, FaBookmark, FaBars } from 'react-icons/fa'
import PropTypes from 'prop-types'
import { db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'
import styles from './MobileNav.module.css'
import MobileMenu from '../MobileMenu/MobileMenu'
import { useAuth } from '../../AuthContext'

const MobileNav = ({ onSearch }) => {

    const { user } = useAuth()
    const [userData, setUserData] = useState(null)

    const handleSearchClick = (e) => {
        e.preventDefault()
        onSearch()
    }

    useEffect(() => {
        const getUserData = async () => {
            if (user?.email) {
                const docRef = doc(db, 'users-data', user.email)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setUserData(docSnap.data())
                }
            }
        }
        getUserData()
    }, [user])

    const [isMenuOpen, setIsMenuOpen] = useState(false)


    return (
        <nav className={styles.mobileNav}>
            <Link to="/">
                <FaHome />
                <span>Inicio</span>
            </Link>
            <button className={styles.searchLink} onClick={handleSearchClick}>
                <FaSearch />
                <span>Buscar</span>
            </button>
            <Link to="/favoritos" className={styles.savedLink}>
                <FaBookmark />
                <span>Guardado</span>
            </Link>
            <button onClick={() => setIsMenuOpen(true)}>
                <FaBars />
                <span>Menú</span>
            </button>
            <MobileMenu 
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onSearch={onSearch}
            />
        </nav>
    )
}

MobileNav.propTypes = {
    onSearch: PropTypes.func.isRequired
}

export default MobileNav