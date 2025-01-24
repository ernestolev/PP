import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styles from './SearchModal.module.css'
import { FaSearch, FaLocationArrow, FaTimes } from 'react-icons/fa'

const SearchModal = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('')
    
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === '#') {
                e.preventDefault()
                setSearchTerm(prev => prev + '#')
            }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes />
                </button>

                <div className={styles.searchSection}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar canchas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className={styles.resultsSection}>
                    {searchTerm && (
                        <>
                            <div className={styles.resultItem}>
                                <img src="/camp1.jpg" alt="Cancha" />
                                <div>
                                    <h4>Cancha La Victoria</h4>
                                    <p>Chincha Alta • S/.50/hora</p>
                                </div>
                            </div>
                            <div className={styles.resultItem}>
                                <img src="/camp2.jpg" alt="Cancha" />
                                <div>
                                    <h4>Cancha Municipal</h4>
                                    <p>Chincha Alta • S/.45/hora</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.shortcutSection}>
                    <span>Pulsa <kbd>#</kbd> para regiones</span>
                    <span>Pulsa <kbd>ESC</kbd> para cerrar</span>
                </div>
            </div>
        </div>
    )
}

SearchModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
}

export default SearchModal