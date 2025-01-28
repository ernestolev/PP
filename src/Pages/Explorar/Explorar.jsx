import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase'
import {
    FaUser,
    FaHeart,
    FaUsers,
    FaClock,
    FaFilter,
    FaSort,
    FaMapMarkerAlt  // Add this import
} from 'react-icons/fa'
import { MdSpaceDashboard } from 'react-icons/md'
import styles from './Explorar.module.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { auth } from '../../firebase'

import SearchModal from '../../Components/SearchModal/SearchModal'
import Navbar from '../../Components/Navbar/Navbar'
import Footer from '../../Components/Footer/Footer'
import MobileNav from '../../Components/Navbar/MobileNav'

import BenefiicioUsuario from '../../Components/BeneficioLogin/BenefiicioUsuario'



const getLowestPriceCampo = (campos) => {
    if (!campos || !campos.length) return null;
    return campos.reduce((lowest, current) => {
        if (!lowest || current.precioHora < lowest.precioHora) {
            return current;
        }
        return lowest;
    });
};

const regiones = [
    "Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho",
    "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco",
    "Ica", "Junín", "La Libertad", "Lambayeque", "Lima",
    "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura",
    "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"
];

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
    const [showFilters, setShowFilters] = useState(false);
    const [sortType, setSortType] = useState('nuevos-desc');
    const [userLocation, setUserLocation] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showMobileMap, setShowMobileMap] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false)


    const handleSearch = () => {
        setIsSearchOpen(true)
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return Math.round(distance * 10) / 10; // Round to 1 decimal
    };


    const highlightedCircleIcon = L.divIcon({
        className: `${styles.circleMarker} ${styles.highlighted}`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    })


    const getSortedCanchas = (canchasToSort) => {
        return [...canchasToSort].sort((a, b) => {
            switch (sortType) {
                case 'nuevos-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'nuevos-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'precio-desc':
                    const priceA = getLowestPriceCampo(a.campos)?.precioHora || 0;
                    const priceB = getLowestPriceCampo(b.campos)?.precioHora || 0;
                    return priceB - priceA;
                case 'precio-asc':
                    const priceC = getLowestPriceCampo(a.campos)?.precioHora || 0;
                    const priceD = getLowestPriceCampo(b.campos)?.precioHora || 0;
                    return priceC - priceD;
                default:
                    return 0;
            }
        });
    };


    const toggleFavorite = async (canchaId, e) => {
        e.stopPropagation();

        if (!user) {
            setShowLoginModal(true);
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
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log("Error getting location:", error);
                }
            );
        }
    }, []);

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
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
            <div className={styles.navdisplay}>
                <Navbar onSearch={() => setIsSearchOpen(true)} />
            </div>
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
                                    <div className={styles.mapPopup}>
                                        <div className={styles.imageSection}>
                                            <img
                                                src={imageUrls[cancha.id] || '/default-field.jpg'}
                                                alt={cancha.nombre}
                                                onError={(e) => {
                                                    e.target.src = '/default-field.jpg';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                            <button
                                                className={`${styles.likeButton} ${favorites.has(cancha.id) ? styles.liked : ''}`}
                                                onClick={(e) => toggleFavorite(cancha.id, e)}
                                            >
                                                <FaHeart />
                                            </button>
                                        </div>
                                        <div className={styles.popupContent}>
                                            <div className={styles.priceTag}>
                                                <span className={styles.price}>
                                                    S/.{getLowestPriceCampo(cancha.campos)?.precioHora || 0}
                                                </span>
                                                <span className={styles.unit}> x hora</span>
                                            </div>
                                            <div className={styles.features}>
                                                <div><MdSpaceDashboard /> {cancha.numeroCampos} campos</div>
                                                <div><FaUsers /> {getLowestPriceCampo(cancha.campos)?.capacidad} jugadores</div>
                                            </div>
                                            <h3>{cancha.nombre}</h3>
                                            <p className={styles.location}>{cancha.region}</p>
                                            <button
                                                className={styles.verButton}
                                                onClick={() => setSelectedCancha(cancha)}
                                            >
                                                Ver cancha
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className={`${styles.mobileMapContainer} ${showMobileMap ? styles.show : ''}`}>
                    <button
                        className={styles.closeMapButton}
                        onClick={() => setShowMobileMap(false)}
                    >
                        &times;
                    </button>
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
                                        <div className={styles.mapPopup}>
                                            <div className={styles.imageSection}>
                                                <img
                                                    src={imageUrls[cancha.id] || '/default-field.jpg'}
                                                    alt={cancha.nombre}
                                                    onError={(e) => {
                                                        e.target.src = '/default-field.jpg';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                                <button
                                                    className={`${styles.likeButton} ${favorites.has(cancha.id) ? styles.liked : ''}`}
                                                    onClick={(e) => toggleFavorite(cancha.id, e)}
                                                >
                                                    <FaHeart />
                                                </button>
                                            </div>
                                            <div className={styles.popupContent}>
                                                <div className={styles.priceTag}>
                                                    <span className={styles.price}>
                                                        S/.{getLowestPriceCampo(cancha.campos)?.precioHora || 0}
                                                    </span>
                                                    <span className={styles.unit}> x hora</span>
                                                </div>
                                                <div className={styles.features}>
                                                    <div><MdSpaceDashboard /> {cancha.numeroCampos} campos</div>
                                                    <div><FaUsers /> {getLowestPriceCampo(cancha.campos)?.capacidad} jugadores</div>
                                                </div>
                                                <h3>{cancha.nombre}</h3>
                                                <p className={styles.location}>{cancha.region}</p>
                                                <button
                                                    className={styles.verButton}
                                                    onClick={() => setSelectedCancha(cancha)}
                                                >
                                                    Ver cancha
                                                </button>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {!showMobileMap && (
                    <button
                        className={styles.showMapButton}
                        onClick={() => setShowMobileMap(true)}
                    >
                        <FaMapMarkerAlt /> Ver Mapa
                    </button>
                )}
                <div className={styles.listSection}>
                    <div className={styles.filterNav}>
                        <div className={styles.sortButton}>
                            <FaSort />
                            <span>Ordenar por:</span>
                            <select
                                value={sortType}
                                onChange={(e) => setSortType(e.target.value)}
                            >
                                <option value="nuevos-desc">Más recientes</option>
                                <option value="nuevos-asc">Más antiguos</option>
                                <option value="precio-asc">Menor precio</option>
                                <option value="precio-desc">Mayor precio</option>
                            </select>
                        </div>
                        <button
                            className={styles.filterButton}
                            onClick={() => setShowFilters(true)}
                        >
                            <FaFilter />
                            Filtros
                        </button>
                    </div>
                    <div className={styles.listContainer}>
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
                                {getSortedCanchas(canchas).map(cancha => {
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
                                                <p className={styles.location}>{cancha.region} / {cancha.ciudad}</p>
                                                {userLocation && (
                                                    <div className={styles.distance}>
                                                        <FaMapMarkerAlt />
                                                        a {calculateDistance(
                                                            userLocation.lat,
                                                            userLocation.lng,
                                                            cancha.latitud,
                                                            cancha.longitud
                                                        )} km
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Footer />
                    </div>
                </div>

            </div>
            <div className={`${styles.filterSidebar} ${showFilters ? styles.show : ''}`}>
                <div className={styles.filterHeader}>
                    <h3>Filtros</h3>
                    <button onClick={() => setShowFilters(false)}>&times;</button>
                </div>

                <div className={styles.filterContent}>
                    <div className={styles.filterSection}>
                        <h4>Precio por hora</h4>
                        <div className={styles.priceRange}>
                            <input type="number" placeholder="Min" />
                            <span>-</span>
                            <input type="number" placeholder="Max" />
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h4>Capacidad</h4>
                        <select>
                            <option value="">Todos</option>
                            <option value="10">10 jugadores</option>
                            <option value="12">12 jugadores</option>
                            <option value="14">14 jugadores</option>
                            <option value="16">16 jugadores</option>
                            <option value="18">18 jugadores</option>
                            <option value="20">20 jugadores</option>
                            <option value="22">22 jugadores</option>
                            <option value="24">24 jugadores</option>
                        </select>
                    </div>

                    <div className={styles.filterSection}>
                        <h4>Región</h4>
                        <select>
                            <option value="">Todas</option>
                            {regiones.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterSection}>
                        <h4>Horario</h4>
                        <select>
                            <option value="">Cualquier hora</option>
                            <option value="morning">Mañana (6am - 12pm)</option>
                            <option value="afternoon">Tarde (12pm - 6pm)</option>
                            <option value="night">Noche (6pm - 12am)</option>
                        </select>
                    </div>

                    <div className={styles.filterActions}>
                        <button className={styles.clearButton}>Limpiar filtros</button>
                        <button className={styles.applyButton}>Aplicar filtros</button>
                    </div>
                </div>
            </div>
            <div
                className={`${styles.overlay} ${showFilters ? styles.show : ''}`}
                onClick={() => setShowFilters(false)}
            />
            <BenefiicioUsuario
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
            <MobileNav onSearch={handleSearch} />

        </>
    )
}

export default Explorar