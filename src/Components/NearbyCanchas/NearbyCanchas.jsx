import React, { useState, useEffect } from 'react'
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
import { FaHeart, FaUsers, FaClock } from 'react-icons/fa'
import { MdSpaceDashboard } from 'react-icons/md'
import { distritosPeru } from '../Data/PeruData'
import styles from './NearbyCanchas.module.css'
import PropTypes from 'prop-types'

const NearbyCanchas = ({ maxDistance = 50 }) => {
    const [nearbyFields, setNearbyFields] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [currentDistrict, setCurrentDistrict] = useState('')
    const [loading, setLoading] = useState(true)
    const [hasLocationPermission, setHasLocationPermission] = useState(false)

    // Calculate distance between two coordinates
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371 // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    // Find nearest region based on coordinates
    const findNearestDistrict = (lat, lng) => {
        let nearest = null
        let minDistance = Infinity

        Object.values(distritosPeru).flat().forEach(distrito => {
            const distance = calculateDistance(lat, lng, distrito.lat, distrito.lng)
            if (distance < minDistance) {
                minDistance = distance
                nearest = distrito
            }
        })

        return nearest
    }

    useEffect(() => {
        const getAllCanchas = async () => {
            const canchasRef = collection(db, 'canchas')
            const querySnapshot = await getDocs(query(canchasRef))
            // Filter only active canchas
            return querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(cancha => cancha.estado === 'activo') // Only return active canchas
        }

        const init = async () => {
            try {
                const activeCanchas = await getAllCanchas()

                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords
                            setUserLocation({ lat: latitude, lng: longitude })
                            setHasLocationPermission(true)

                            const nearest = findNearestDistrict(latitude, longitude)
                            if (nearest) {
                                setCurrentDistrict(nearest.nombre)
                            }

                            // Filter active canchas by distance
                            const nearbyCanchas = activeCanchas
                                .map(cancha => ({
                                    ...cancha,
                                    distance: calculateDistance(
                                        latitude,
                                        longitude,
                                        cancha.latitud,
                                        cancha.longitud
                                    )
                                }))
                                .filter(cancha => cancha.distance <= maxDistance)
                                .sort((a, b) => a.distance - b.distance)

                            setNearbyFields(nearbyCanchas)
                            setLoading(false)
                        },
                        () => {
                            // Show all active canchas when location is denied
                            setNearbyFields(activeCanchas)
                            setLoading(false)
                        }
                    )
                } else {
                    // Show all active canchas when geolocation is not supported
                    setNearbyFields(activeCanchas)
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error:', error)
                setLoading(false)
            }
        }

        init()
    }, [maxDistance])

    const LocationPrompt = () => (
        <div className={styles.locationPrompt}>
            <div className={styles.locationPromptContent}>
                <svg className={styles.locationIcon} viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <div className={styles.locationText}>
                    <h4>¿Quieres ver canchas cerca a ti?</h4>
                    <p>Activa tu ubicación para mostrarte las canchas más cercanas</p>
                </div>
                <button
                    className={styles.enableLocation}
                    onClick={() => {
                        if ("geolocation" in navigator) {
                            navigator.geolocation.getCurrentPosition(
                                () => {
                                    setHasLocationPermission(true)
                                    window.location.reload()
                                },
                                (error) => {
                                    console.error("Error getting location:", error)
                                    alert("Por favor, permite el acceso a tu ubicación en la configuración de tu navegador")
                                }
                            )
                        }
                    }}
                >
                    Activar Ubicación
                </button>
            </div>
        </div>
    )

    if (loading) {
        return <div className={styles.loading}>Cargando canchas cercanas...</div>
    }

    return (
        <div className={styles.featuredContainer}>
            <h2>
                {hasLocationPermission && currentDistrict
                    ? `Canchas Destacadas en ${currentDistrict}`
                    : 'Canchas Destacadas en Perú'}
            </h2>
            <p>
                {hasLocationPermission
                    ? 'Encuentra las mejores canchas de fútbol cercanas a ti'
                    : 'Descubre las mejores canchas de fútbol en Perú'}
            </p>

            {!hasLocationPermission && <LocationPrompt />}


            <div className={styles.fieldsGrid}>
                {nearbyFields.length > 0 ? (
                    nearbyFields.map((field) => {
                        // Add null checks and defaults
                        const defaultImage = '/path-to-default-image.jpg'
                        const firstCampo = field.campos?.[0] || {}

                        return (
                            <div key={field.id} className={styles.fieldCard}>
                                <div className={styles.imageSection}>
                                    <img
                                        src={firstCampo.fotos?.[0]}
                                        alt={field.nombre}
                                        onError={(e) => {
                                            e.target.src = '/default-field.jpg' // Make sure this image exists in your public folder
                                        }}
                                    />
                                    <button className={styles.likeButton}>
                                        <FaHeart />
                                    </button>
                                </div>

                                <div className={styles.fieldInfo}>
                                    <div className={styles.priceTag}>
                                        <span className={styles.price}>
                                            S/.{firstCampo.precioHora}
                                        </span>
                                        <span className={styles.unit}> x hora</span>
                                    </div>

                                    <div className={styles.features}>
                                        <div>
                                            <MdSpaceDashboard /> {field.numeroCampos} campos
                                        </div>
                                        <div>
                                            <FaUsers /> {firstCampo.capacidad} jugadores
                                        </div>
                                        <div>
                                            <FaClock /> {firstCampo.horaInicio} - {firstCampo.horaFin}
                                        </div>
                                    </div>

                                    <h3>{field.nombre}</h3>
                                    <span className={styles.fieldId}>ID: {field.id.substring(0, 6)}</span>

                                    {hasLocationPermission && field.distance && (
                                        <p className={styles.distance}>
                                            A {Math.round(field.distance * 10) / 10} km de distancia
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p className={styles.noFields}>
                        {hasLocationPermission
                            ? `No se encontraron canchas en un radio de ${maxDistance}km`
                            : 'No hay canchas registradas en este momento'}
                    </p>
                )}
            </div>
        </div>
    )
}

NearbyCanchas.propTypes = {
    maxDistance: PropTypes.number
}

export default NearbyCanchas