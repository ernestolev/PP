

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    FaUser,
    FaFutbol,
    FaHeart,
    FaHistory,
    FaArrowLeft,
    FaUsers,
    FaClock,
} from 'react-icons/fa'
import { useAuth } from '../../AuthContext'
import {
    doc,
    updateDoc,
    getDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '../../firebase'
import styles from './Ajustes.module.css'
import { MdSpaceDashboard } from 'react-icons/md'

import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword
} from 'firebase/auth';

import SearchModal from '../../Components/SearchModal/SearchModal'
import Navbar from '../../Components/Navbar/Navbar'
import Footer from '../../Components/Footer/Footer'
import MobileNav from '../../Components/Navbar/MobileNav'
import imageCompression from 'browser-image-compression'
import TbCanchas from '../../Components/Tbcanchas/Tbcanchas'
import ModalAddCancha from '../../Components/ModalAddCancha/ModalAddCancha'
import PasswordModal from '../../Components/PasswordModal/PasswordModal'




const Favoritos = () => {
    const [activeTab, setActiveTab] = useState('favoritos')
    const { user, userData } = useAuth()
    const [previewImage, setPreviewImage] = useState(null)
    const [showImagePreview, setShowImagePreview] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [canchas, setCanchas] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedCancha, setSelectedCancha] = useState(null)
    const [favoriteCanchas, setFavoriteCanchas] = useState([])
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);


    const handleAddCancha = async (formData) => {

        const [showPassword, setShowPassword] = useState(false);

        try {
            // Simplify campos structure
            const cleanData = {
                nombre: formData.nombre,
                estado: formData.estado,
                numeroCampos: parseInt(formData.numeroCampos),
                region: formData.region,
                ciudad: formData.ciudad,
                ubicacion: formData.ubicacion,
                latitud: parseFloat(formData.latitud),
                longitud: parseFloat(formData.longitud),
                descripcion: formData.descripcion,
                mapsLink: formData.mapsLink || '',
                campos: formData.campos.map(campo => ({
                    capacidad: Number(campo.capacidad),
                    horaInicio: campo.horaInicio,
                    horaFin: campo.horaFin,
                    precioHora: Number(campo.precioHora),
                    fotos: campo.fotos || []
                })),
                userId: user.email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'canchas'), cleanData);
            console.log('Document written with ID: ', docRef.id);
            setShowAddModal(false);
            await fetchCanchas();
            return true;

        } catch (error) {
            console.error('Error adding cancha:', error);
            throw error;
        }
    };

    const handlePasswordUpdate = async (formData) => {
        try {
            setLoading(true);

            // Check if user is Google-authenticated
            const isGoogleUser = user.providerData[0].providerId === 'google.com';

            if (isGoogleUser && !userData?.hasPassword) {
                // For Google users setting password first time
                await updatePassword(user, formData.newPassword);
            } else {
                // For users updating existing password
                const credential = EmailAuthProvider.credential(
                    user.email,
                    formData.currentPassword
                );

                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, formData.newPassword);
            }

            // Update hasPassword flag in Firestore
            const userRef = doc(db, 'users-data', user.email);
            await updateDoc(userRef, {
                hasPassword: true,
                updatedAt: new Date().toISOString()
            });

            setShowPasswordModal(false);
            alert('Contraseña actualizada exitosamente');

        } catch (error) {
            console.error('Error updating password:', error);

            if (error.code === 'auth/requires-recent-login') {
                alert('Por seguridad, necesitas volver a iniciar sesión antes de cambiar tu contraseña.');
                // You might want to redirect to login here
            } else if (error.code === 'auth/missing-password') {
                alert('Por favor, ingresa una contraseña válida.');
            } else {
                alert('Error al actualizar la contraseña. Por favor, intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };



    const fetchFavoriteCanchas = async () => {
        if (!user?.email) return;

        try {
            // Get user's favorites
            const favoritesQuery = query(
                collection(db, 'favoritos'),
                where('userId', '==', user.email)
            );
            const favoritesSnapshot = await getDocs(favoritesQuery);

            // Get all favorited cancha IDs
            const favoritedIds = favoritesSnapshot.docs.map(doc => doc.data().canchaId);

            if (favoritedIds.length === 0) {
                setFavoriteCanchas([]);
                return;
            }

            // Fetch actual cancha data
            const canchasData = [];
            for (const id of favoritedIds) {
                const canchaDoc = await getDoc(doc(db, 'canchas', id));
                if (canchaDoc.exists()) {
                    canchasData.push({ id: canchaDoc.id, ...canchaDoc.data() });
                }
            }

            setFavoriteCanchas(canchasData);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    useEffect(() => {
        fetchCanchas();
        fetchFavoriteCanchas();
    }, [user]);

    const handleEditCancha = (cancha) => {
        console.log('Editing cancha:', cancha); // Debug log
        setSelectedCancha({
            ...cancha,
            id: cancha.id // Ensure ID is included
        });
        setIsEditing(true);
        setShowAddModal(true);
    };

    const handleUpdateCancha = async (formData) => {
        try {
            // Validate ID exists
            if (!formData.id) {
                throw new Error('ID de cancha no encontrado');
            }

            // Extract ID and create remaining data object
            const { id, ...updateData } = formData;

            // Clean data structure for Firestore
            const cleanData = {
                nombre: updateData.nombre,
                estado: updateData.estado,
                numeroCampos: parseInt(updateData.numeroCampos),
                region: updateData.region,
                ciudad: updateData.ciudad,
                ubicacion: updateData.ubicacion,
                latitud: parseFloat(updateData.latitud),
                longitud: parseFloat(updateData.longitud),
                descripcion: updateData.descripcion,
                mapsLink: updateData.mapsLink || '',
                campos: updateData.campos.map(campo => ({
                    capacidad: parseInt(campo.capacidad),
                    horaInicio: campo.horaInicio,
                    horaFin: campo.horaFin,
                    precioHora: parseFloat(campo.precioHora),
                    fotos: Array.isArray(campo.fotos) ? campo.fotos : []
                })),
                updatedAt: new Date().toISOString()
            };

            // Update document in Firestore
            const canchaRef = doc(db, 'canchas', String(id));
            await updateDoc(canchaRef, cleanData);
            await fetchCanchas();
            return true;

        } catch (error) {
            console.error('Error updating cancha:', error);
            throw error;
        }
    };

    const handleDeleteCancha = async (canchaId) => {
        if (window.confirm('¿Estás seguro de eliminar esta cancha? Esta acción no se puede deshacer.')) {
            try {
                await deleteDoc(doc(db, 'canchas', canchaId))
                // Refresh list
                const newCanchas = canchas.filter(c => c.id !== canchaId)
                setCanchas(newCanchas)
            } catch (error) {
                console.error('Error deleting cancha:', error)
                alert('Error al eliminar la cancha')
            }
        }
    }


    const [isSearchOpen, setIsSearchOpen] = useState(false)

    const handleSearch = () => {
        setIsSearchOpen(true)
    }

    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        region: '',
        phone: '',
        whatsapp: '',
        profileImage: '',
        facebook: '',
        twitter: '',
        instagram: '',
        tiktok: '',
        youtube: '',
        linkedin: ''
    })
    const [loading, setLoading] = useState(false)
    const storage = getStorage()


    const fetchCanchas = async () => {
        if (!user?.email) return

        try {
            const q = query(
                collection(db, 'canchas'),
                where('userId', '==', user.email)
            )
            const querySnapshot = await getDocs(q)
            const canchasData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setCanchas(canchasData)
        } catch (error) {
            console.error('Error fetching canchas:', error)
        }
    }


    useEffect(() => {

        fetchCanchas()

        const fetchUserData = async () => {
            if (user?.email) {
                try {
                    const userDocRef = doc(db, 'users-data', user.email)
                    const userDocSnap = await getDoc(userDocRef)

                    if (userDocSnap.exists()) {
                        const data = userDocSnap.data()
                        setEditForm({
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            email: data.email || '',
                            region: data.region || '',
                            phone: data.phone || '',
                            whatsapp: data.whatsapp || '',
                            profileImage: data.profileImage || user?.photoURL || '',
                            facebook: data.facebook || '',
                            twitter: data.twitter || '',
                            instagram: data.instagram || '',
                            tiktok: data.tiktok || '',
                            youtube: data.youtube || '',
                            linkedin: data.linkedin || ''
                        })
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error)
                }
            }
        }

        fetchUserData()
    }, [user])



    const handleImageSelect = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true
            }

            const compressedFile = await imageCompression(file, options)
            setSelectedFile(compressedFile)

            // Create preview URL
            const previewUrl = URL.createObjectURL(compressedFile)
            setPreviewImage(previewUrl)
            setShowImagePreview(true)
        } catch (error) {
            console.error('Error compressing image:', error)
        }
    }


    const handleConfirmUpload = async () => {
        if (!selectedFile) return

        try {
            setLoading(true)
            const storageRef = ref(storage, `profile-images/${user.email}`)
            await uploadBytes(storageRef, selectedFile)
            const imageUrl = await getDownloadURL(storageRef)

            setEditForm(prev => ({
                ...prev,
                profileImage: imageUrl
            }))

            // Update in Firestore
            const userRef = doc(db, 'users-data', user.email)
            await updateDoc(userRef, {
                profileImage: imageUrl
            })

            setShowImagePreview(false)
            setPreviewImage(null)
            setSelectedFile(null)
        } catch (error) {
            console.error('Error uploading image:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelUpload = () => {
        setShowImagePreview(false)
        setPreviewImage(null)
        setSelectedFile(null)
    }

    const handleSaveChanges = async () => {
        try {
            setLoading(true)
            const userRef = doc(db, 'users-data', userData.email)
            await updateDoc(userRef, {
                ...editForm,
                updatedAt: new Date()
            })
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating profile:', error)
        } finally {
            setLoading(false)
        }
    }



    const renderContent = () => {
        switch (activeTab) {
           
            case 'favoritos':
                return (
                    <div className={styles.contentSection}>
                        <h2>Mis Canchas Favoritas</h2>
                        {favoriteCanchas.length > 0 ? (
                            <div className={styles.fieldsGrid}>
                                {favoriteCanchas.map((field) => {
                                    const firstCampo = field.campos?.[0] || {};
                                    return (
                                        <div key={field.id} className={styles.fieldCard}>
                                            <div className={styles.imageSectionFav}>
                                                <img
                                                    src={firstCampo.fotos?.[0] || '/default-field.jpg'}
                                                    alt={field.nombre}
                                                    onError={(e) => {
                                                        e.target.src = '/default-field.jpg'
                                                    }}
                                                />
                                                <button className={`${styles.likeButton} ${styles.liked}`}>
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
                                                <p className={styles.location}>{field.region}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <FaHeart size={48} color="#ccc" />
                                <h3>No tienes canchas favoritas</h3>
                                <p>Las canchas que marques como favoritas aparecerán aquí</p>
                            </div>
                        )}
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <>
            <div className={styles.navbarContainer}>
                <Navbar onSearch={() => setIsSearchOpen(true)} />
            </div>            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
            <div className={styles.settingsContainer}>
                <Link to="/" className={styles.backButton}>
                    <FaArrowLeft /> Volver
                </Link>

                <div className={styles.settingsWrapper}>
                    <aside className={styles.sidebar}>
                        <div className={styles.userHeader}>
                            <img
                                src={editForm.profileImage || user?.photoURL || `https://ui-avatars.com/api/?name=${editForm.firstName}`}
                                alt="Profile"
                                className={styles.userAvatar}
                            />
                            <div className={styles.userInfo}>
                                <h3>{editForm.firstName} {editForm.lastName}</h3>
                                <p className={styles.userType}>Mi cuenta</p>
                            </div>
                        </div>

                        <nav className={styles.nav}>
                            <Link to="/ajustes" className={styles.backButton}>
                                <button
                                    className={`${styles.navButton} ${activeTab === '' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('cuenta')}
                                >
                                    <FaUser />
                                    <span>Configuración de cuenta</span>
                                </button>
                            </Link>
                            <Link to="/MisCanchas" className={styles.backButton}>
                                <button
                                    className={`${styles.navButton} ${activeTab === 'canchas' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('canchas')}
                                >
                                    <FaFutbol />
                                    <span>Mis canchas</span>
                                </button>
                            </Link>

                            <Link to="/Favoritos" className={styles.backButton}>
                                <button
                                    className={`${styles.navButton} ${activeTab === 'favoritos' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('favoritos')}
                                >
                                    <FaHeart />
                                    <span>Canchas favoritas</span>
                                </button>
                            </Link>

                            <Link to="/VistosRecientemente" className={styles.backButton}>
                                <button
                                    className={`${styles.navButton} ${activeTab === 'recientes' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('recientes')}
                                >
                                    <FaHistory />
                                    <span>Vistos recientemente</span>
                                </button>
                            </Link>


                        </nav>
                    </aside>

                    <main className={styles.mainContent}>
                        {renderContent()}
                    </main>
                </div>
            </div>
            <MobileNav onSearch={handleSearch} />
            <Footer />
        </>
    )
}

export default Favoritos