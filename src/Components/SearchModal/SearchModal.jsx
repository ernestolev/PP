import React, { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import { regionesPeru } from '../Data/PeruData'
import PropTypes from 'prop-types'
import styles from './SearchModal.module.css'
import { FaSearch, FaTimes } from 'react-icons/fa'

const SearchModal = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [allCanchas, setAllCanchas] = useState([]) 

    const searchCanchas = async (term) => {
        setLoading(true)
        setError(null)
        try {
            const canchasRef = collection(db, 'canchas')
            let q;

            if (term.startsWith('#')) {
                // Remove # and normalize region name
                const region = term.slice(1).trim()
                if (!region) {
                    setSearchResults([])
                    return
                }

                // Find exact region match (case insensitive)
                const matchedRegion = regionesPeru.find(r =>
                    r.nombre.toLowerCase() === region.toLowerCase()
                )

                if (matchedRegion) {
                    q = query(
                        canchasRef,
                        where('estado', '==', 'activo'),
                        where('region', '==', matchedRegion.nombre)
                    )
                } else {
                    setSearchResults([])
                    return
                }
            } else {
                // Normal name search
                const termLower = term.toLowerCase().trim()
                if (!termLower) {
                    setSearchResults([])
                    return
                }
                q = query(
                    canchasRef,
                    where('estado', '==', 'activo'),
                    where('nombre', '>=', termLower),
                    where('nombre', '<=', termLower + '\uf8ff')
                )
            }

            const querySnapshot = await getDocs(q)
            const results = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            setSearchResults(results)

            // Log for debugging
            console.log('Search results:', results)

        } catch (err) {
            console.error('Error searching:', err)
            if (err.code === 'failed-precondition') {
                setError(`
                    Índice requerido. Cree los siguientes índices en Firebase:
                    1. canchas: estado ASC, nombre ASC
                    2. canchas: estado ASC, region ASC
                `)
            } else {
                setError('Error en la búsqueda')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchAllCanchas = async () => {
            if (isOpen && allCanchas.length === 0) {
                setLoading(true)
                try {
                    const canchasRef = collection(db, 'canchas')
                    const q = query(canchasRef, where('estado', '==', 'activo'))
                    const querySnapshot = await getDocs(q)
                    const results = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    setAllCanchas(results)
                } catch (err) {
                    console.error('Error fetching canchas:', err)
                    setError('Error al cargar canchas')
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchAllCanchas()
    }, [isOpen])

    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([])
            return
        }

        if (searchTerm.startsWith('#')) {
            const region = searchTerm.slice(1).trim().toLowerCase()
            const filtered = allCanchas.filter(cancha => 
                cancha.region.toLowerCase().includes(region)
            )
            setSearchResults(filtered)
        } else {
            const term = searchTerm.toLowerCase().trim()
            const filtered = allCanchas.filter(cancha => 
                cancha.nombre.toLowerCase().includes(term)
            )
            setSearchResults(filtered)
        }
    }, [searchTerm, allCanchas])

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value)
    }

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
                        placeholder="Buscar canchas o usar # para región..."
                        value={searchTerm}
                        onChange={handleInputChange}
                        autoFocus
                    />
                </div>

                <div className={styles.resultsSection}>
                    {loading && <div className={styles.loading}>Buscando...</div>}
                    {error && <div className={styles.error}>{error}</div>}

                    {!loading && !error && searchTerm.startsWith('#') && !searchResults.length && (
                        <div className={styles.suggestions}>
                            <h4>Regiones disponibles:</h4>
                            <div className={styles.regionList}>
                                {regionesPeru.map(region => (
                                    <button
                                        key={region.nombre}
                                        onClick={() => setSearchTerm(`#${region.nombre}`)}
                                        className={styles.regionTag}
                                    >
                                        #{region.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && searchResults.map(cancha => (
                        <div key={cancha.id} className={styles.resultItem}>
                            <img
                                src={cancha.campos?.[0]?.fotos?.[0] || '/default-field.jpg'}
                                alt={cancha.nombre}
                                onError={(e) => {
                                    e.target.src = '/default-field.jpg'
                                }}
                            />
                            <div>
                                <h4>{cancha.nombre}</h4>
                                <p>
                                    {cancha.region} • S/.{cancha.campos?.[0]?.precioHora || 0}/hora
                                </p>
                            </div>
                        </div>
                    ))}

                    {!loading && searchTerm && !searchResults.length && (
                        <div className={styles.noResults}>
                            No se encontraron canchas
                        </div>
                    )}
                </div>

                <div className={styles.shortcutSection}>
                    <span>Pulsa <kbd>#</kbd> para buscar por región</span>
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