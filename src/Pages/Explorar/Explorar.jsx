import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase'
import { FaHeart, FaUsers, FaClock } from 'react-icons/fa'
import { MdSpaceDashboard } from 'react-icons/md'
import styles from './Explorar.module.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { auth } from '../../firebase'


import Navbar from '../../Components/Navbar/Navbar'
import Footer from '../../Components/Footer/Footer'



const getLowestPriceCampo = (campos) => {
    if (!campos || !campos.length) return null;
    return campos.reduce((lowest, current) => {
        if (!lowest || current.precioHora < lowest.precioHora) {
            return current;
        }
        return lowest;
    });
};

const circleIcon = L.divIcon({
    className: styles.circleMarker,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});


const Explorar = () => {
    const [favorites, setFavorites] = useState(new Set())
    const [canchas, setCanchas] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCancha, setSelectedCancha] = useState(null)
    const defaultCenter = [-12.046374, -77.042793]
    const [hoveredCancha, setHoveredCancha] = useState(null)
    const [user, setUser] = useState(null)

    const highlightedCircleIcon = L.divIcon({
        className: `${styles.circleMarker} ${styles.highlighted}`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    })

    const toggleFavorite = async (canchaId, e) => {
        e.stopPropagation();

        if (!user) {
            alert('Debes iniciar sesión para guardar favoritos');
            return;
        }

        try {
            console.log('Toggling favorite for cancha:', canchaId);
            const favoritesRef = collection(db, 'favoritos');
            const q = query(
                favoritesRef,
                where('userId', '==', user.email),
                where('canchaId', '==', canchaId)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Add to favorites
                const docRef = await addDoc(favoritesRef, {
                    userId: user.email,
                    canchaId: canchaId,
                    createdAt: new Date().toISOString()
                });
                console.log('Added to favorites, doc ID:', docRef.id);
                setFavorites(prev => new Set([...prev, canchaId]));
            } else {
                // Remove from favorites
                const docToDelete = querySnapshot.docs[0];
                await deleteDoc(doc(db, 'favoritos', docToDelete.id));
                console.log('Removed from favorites');
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    newFavorites.delete(canchaId);
                    return newFavorites;
                });
            }
        } catch (error) {
            console.error('Error updating favorites:', error);
            alert('Error al actualizar favoritos');
        }
    };


    const getFirstCampoImage = async (campos) => {
        if (!campos || !campos.length || !campos[0].fotos || !campos[0].fotos.length) {
            return '/default-field.jpg';
        }

        try {
            const foto = campos[0].fotos[0];

            if (typeof foto === 'string') {
                // Handle data URLs
                if (foto.startsWith('data:')) {
                    return foto;
                }
                // Handle blob URLs
                if (foto.startsWith('blob:')) {
                    try {
                        const response = await fetch(foto);
                        const blob = await response.blob();
                        return URL.createObjectURL(blob);
                    } catch {
                        return '/default-field.jpg';
                    }
                }
                // Handle http/https URLs
                if (foto.startsWith('http')) {
                    return foto;
                }
            }

            return '/default-field.jpg';
        } catch (error) {
            console.error('Error getting image:', error);
            return '/default-field.jpg';
        }
    };

    const [imageUrls, setImageUrls] = useState({});

    useEffect(() => {
        // Pre-load and convert all images
        const loadImages = async () => {
            const urls = {};
            for (const cancha of canchas) {
                if (cancha.campos?.[0]?.fotos?.[0]) {
                    urls[cancha.id] = await getFirstCampoImage(cancha.campos);
                }
            }
            setImageUrls(urls);
        };

        loadImages();
    }, [canchas]);

    useEffect(() => {
        const fetchCanchas = async () => {
            try {
                const q = query(
                    collection(db, 'canchas'),
                    where('estado', '==', 'activo')
                )
                const querySnapshot = await getDocs(q)
                const canchasData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setCanchas(canchasData)
            } catch (error) {
                console.error('Error fetching canchas:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCanchas()
    }, [])

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(currentUser => {
            setUser(currentUser)
            if (currentUser) {
                fetchUserFavorites(currentUser.email)
            }
        })

        return () => unsubscribe()
    }, [])

    const fetchUserFavorites = async (userEmail) => {
        try {
            console.log('Fetching favorites for:', userEmail);
            const q = query(
                collection(db, 'favoritos'),
                where('userId', '==', userEmail)
            );
            const querySnapshot = await getDocs(q);
            const favoritesSet = new Set();
            querySnapshot.forEach(doc => {
                favoritesSet.add(doc.data().canchaId);
            });
            console.log('Fetched favorites:', Array.from(favoritesSet));
            setFavorites(favoritesSet);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    return (
        <>
            <Navbar onSearch={() => setIsSearchOpen(true)} />
            <div className={styles.explorarContainer}>
                <div className={styles.mapSection}>
                    <MapContainer
                        center={defaultCenter}
                        zoom={6}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        {/* Existing markers */}
                        {canchas.map(cancha => (
                            <Marker
                                key={cancha.id}
                                position={[cancha.latitud, cancha.longitud]}
                                icon={hoveredCancha === cancha.id ? highlightedCircleIcon : circleIcon}
                                eventHandlers={{
                                    click: () => setSelectedCancha(cancha)
                                }}
                            >
                                <Popup>
                                    <div className={styles.popup}>
                                        <h3>{cancha.nombre}</h3>
                                        <p>{cancha.region}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>


                <div className={styles.listSection}>
                    <div className={styles.listHeader}>
                        <h2>Canchas Disponibles</h2>
                        {!loading && (
                            <p className={styles.results}>
                                Mostrando {canchas.length} {canchas.length === 1 ? 'resultado' : 'resultados'}
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className={styles.loading}>Cargando canchas...</div>
                    ) : (
                        <div className={styles.canchasList}>
                            {canchas.map(cancha => {
                                const lowestPriceCampo = getLowestPriceCampo(cancha.campos);
                                const isFavorite = favorites.has(cancha.id); // This line is correct

                                console.log('Cancha:', cancha.id, 'isFavorite:', isFavorite); // Debug log

                                return (
                                    <div
                                        key={cancha.id}
                                        className={`${styles.canchaCard} ${selectedCancha?.id === cancha.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedCancha(cancha)}
                                        onMouseEnter={() => setHoveredCancha(cancha.id)}
                                        onMouseLeave={() => setHoveredCancha(null)}
                                    >
                                        <div className={styles.imageSection}>
                                            <img
                                                src={imageUrls[cancha.id] || '/default-field.jpg'}
                                                alt={cancha.nombre}
                                                onError={(e) => {
                                                    e.target.src = '/default-field.jpg';
                                                    e.target.onerror = null;
                                                }}
                                                loading="lazy"
                                            />
                                            <button
                                                className={`${styles.likeButton} ${isFavorite ? styles.liked : ''}`}
                                                onClick={(e) => toggleFavorite(cancha.id, e)}
                                                title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                                            >
                                                <FaHeart />
                                            </button>
                                        </div>

                                        <div className={styles.canchaInfo}>
                                            <div className={styles.priceTag}>
                                                <span className={styles.price}>
                                                    S/.{lowestPriceCampo?.precioHora || 0}
                                                </span>
                                                <span className={styles.unit}> x hora</span>
                                            </div>

                                            <div className={styles.features}>
                                                <div>
                                                    <MdSpaceDashboard /> {cancha.numeroCampos} campos
                                                </div>
                                                <div>
                                                    <FaUsers /> {lowestPriceCampo?.capacidad} jugadores
                                                </div>
                                                <div>
                                                    <FaClock /> {lowestPriceCampo?.horaInicio} - {lowestPriceCampo?.horaFin}
                                                </div>
                                            </div>

                                            <h3>{cancha.nombre}</h3>
                                            <p className={styles.location}>{cancha.region}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <Footer />
                </div>

            </div>
        </>
    )
}

export default Explorar