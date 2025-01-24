import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaUser, FaFutbol, FaHeart, FaHistory, FaArrowLeft } from 'react-icons/fa'
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

import SearchModal from '../../Components/SearchModal/SearchModal'
import Navbar from '../../Components/Navbar/Navbar'
import Footer from '../../Components/Footer/Footer'
import MobileNav from '../../Components/Navbar/MobileNav'
import imageCompression from 'browser-image-compression'
import TbCanchas from '../../Components/Tbcanchas/Tbcanchas'
import ModalAddCancha from '../../Components/ModalAddCancha/ModalAddCancha'

const Ajustes = () => {
    const [activeTab, setActiveTab] = useState('cuenta')
    const { user, userData } = useAuth()
    const [previewImage, setPreviewImage] = useState(null)
    const [showImagePreview, setShowImagePreview] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [canchas, setCanchas] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedCancha, setSelectedCancha] = useState(null)
    // Add these functions:
    const handleAddCancha = async (formData) => {
        try {
            // Clean and validate data before saving
            const cleanData = {
                estado: formData.estado,
                numeroCampos: formData.numeroCampos,
                ubicacion: formData.ubicacion,
                latitud: formData.latitud,
                longitud: formData.longitud,
                descripcion: formData.descripcion,
                campos: formData.campos.map(campo => ({
                    capacidad: parseInt(campo.capacidad),
                    horaInicio: campo.horaInicio,
                    horaFin: campo.horaFin,
                    precioHora: parseFloat(campo.precioHora),
                    fotos: campo.fotos // These should be base64 strings already
                })),
                userId: user.email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            // Add validation
            if (!cleanData.campos.every(campo =>
                campo.capacidad &&
                campo.horaInicio &&
                campo.horaFin &&
                campo.precioHora &&
                campo.fotos.length > 0
            )) {
                throw new Error('Todos los campos son requeridos')
            }

            await addDoc(collection(db, 'canchas'), cleanData)
            setShowAddModal(false)

            // Refresh canchas list
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
            console.error('Error adding cancha:', error)
            alert(error.message || 'Error al guardar la cancha')
        }
    }
    const handleEditCancha = (cancha) => {
        setSelectedCancha(cancha)
        setIsEditing(true)
        setShowAddModal(true)
    }

    const handleUpdateCancha = async (updatedData) => {
        try {
            const canchaRef = doc(db, 'canchas', selectedCancha.id)
            await updateDoc(canchaRef, {
                ...updatedData,
                updatedAt: new Date().toISOString()
            })
            
            await fetchCanchas() // Refresh list after update
            setShowAddModal(false)
            setSelectedCancha(null)
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating cancha:', error)
            alert('Error al actualizar la cancha')
        }
    }

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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setLoading(true)
            const storageRef = ref(storage, `profile-images/${userData.email}`)
            await uploadBytes(storageRef, file)
            const imageUrl = await getDownloadURL(storageRef)

            setEditForm(prev => ({
                ...prev,
                profileImage: imageUrl
            }))
        } catch (error) {
            console.error('Error uploading image:', error)
        } finally {
            setLoading(false)
        }
    }

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
            case 'cuenta':
                return (
                    <div className={styles.contentSection}>
                        <h2>Información de la cuenta</h2>
                        <div className={styles.profileGrid}>
                            <div className={styles.imageSection}>
                                <div className={styles.imageWrapper}>
                                    <img
                                        src={editForm.profileImage || user?.photoURL || `https://ui-avatars.com/api/?name=${editForm.firstName}`}
                                        alt="Profile"
                                        className={styles.profileImage}
                                    />
                                    <label htmlFor="imageUpload" className={styles.imageOverlay}>
                                        <span>Cambiar foto</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        id="imageUpload"
                                        hidden
                                    />
                                </div>
                                {showImagePreview && (
                                    <div className={styles.previewModal}>
                                        <div className={styles.previewContent}>
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className={styles.previewImage}
                                            />
                                            <div className={styles.previewActions}>
                                                <button
                                                    onClick={handleCancelUpload}
                                                    className={styles.cancelButton}
                                                    disabled={loading}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleConfirmUpload}
                                                    className={styles.confirmButton}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Subiendo...' : 'Confirmar'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>


                            <div className={styles.formSection}>
                                <div className={styles.formColumn}>
                                    <div className={styles.inputGroup}>
                                        <label>Nombre</label>
                                        <input
                                            type="text"
                                            value={editForm.firstName}
                                            disabled
                                            onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Apellido</label>
                                        <input
                                            type="text"
                                            value={editForm.lastName}
                                            disabled
                                            onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                            placeholder="Tu apellido"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            disabled
                                            className={styles.disabledInput}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Región</label>
                                        <input
                                            type="text"
                                            value={editForm.region}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, region: e.target.value }))}
                                            placeholder="Tu región"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Código de país</label>
                                        <input
                                            type="text"
                                            value={editForm.countryCode}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, countryCode: e.target.value }))}
                                            placeholder="+51"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Teléfono</label>
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="Tu teléfono"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Código WhatsApp</label>
                                        <input
                                            type="text"
                                            value={editForm.whatsappCode}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, whatsappCode: e.target.value }))}
                                            placeholder="+51"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>WhatsApp</label>
                                        <input
                                            type="tel"
                                            value={editForm.whatsapp}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                                            placeholder="Tu WhatsApp"
                                        />
                                    </div>

                                    <h3>Redes Sociales</h3>
                                    {['facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'linkedin'].map(network => (
                                        <div className={styles.inputGroup} key={network}>
                                            <label>{network.charAt(0).toUpperCase() + network.slice(1)}</label>
                                            <input
                                                type="url"
                                                value={editForm[network]}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, [network]: e.target.value }))}
                                                placeholder={`URL de ${network}`}
                                            />
                                        </div>
                                    ))}

                                    <button
                                        className={styles.saveButton}
                                        onClick={handleSaveChanges}
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando cambios...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'canchas':
                return (
                    <div className={styles.contentSection}>
                        <TbCanchas
                            canchas={canchas}
                            onAdd={() => {
                                setIsEditing(false)
                                setSelectedCancha(null)
                                setShowAddModal(true)
                            }}
                            onEdit={handleEditCancha}
                            onDelete={handleDeleteCancha}
                        />
                        <ModalAddCancha
                            isOpen={showAddModal}
                            onClose={() => {
                                setShowAddModal(false)
                                setSelectedCancha(null)
                                setIsEditing(false)
                            }}
                            onSubmit={isEditing ? handleUpdateCancha : handleAddCancha}
                            initialData={selectedCancha}
                            isEditing={isEditing}
                        />
                    </div>
                )
            // Add other cases...
            default:
                return null
        }
    }

    return (
        <>
            <Navbar onSearch={() => setIsSearchOpen(true)} />
            <SearchModal
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
                            <button
                                className={`${styles.navButton} ${activeTab === 'cuenta' ? styles.active : ''}`}
                                onClick={() => setActiveTab('cuenta')}
                            >
                                <FaUser />
                                <span>Configuración de cuenta</span>
                            </button>
                            <button
                                className={`${styles.navButton} ${activeTab === 'canchas' ? styles.active : ''}`}
                                onClick={() => setActiveTab('canchas')}
                            >
                                <FaFutbol />
                                <span>Mis canchas</span>
                            </button>
                            <button
                                className={`${styles.navButton} ${activeTab === 'favoritos' ? styles.active : ''}`}
                                onClick={() => setActiveTab('favoritos')}
                            >
                                <FaHeart />
                                <span>Canchas favoritas</span>
                            </button>
                            <button
                                className={`${styles.navButton} ${activeTab === 'recientes' ? styles.active : ''}`}
                                onClick={() => setActiveTab('recientes')}
                            >
                                <FaHistory />
                                <span>Vistos recientemente</span>
                            </button>
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

export default Ajustes