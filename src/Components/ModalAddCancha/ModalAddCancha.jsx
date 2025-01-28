import React, { useState, useEffect } from 'react'
import { FaTimes, FaImage } from 'react-icons/fa'
import imageCompression from 'browser-image-compression'
import PropTypes from 'prop-types'
import styles from './ModalAddCancha.module.css'
import { regionesPeru, distritosPeru } from '../Data/PeruData'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'


import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'




const customIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
})
const initialFormState = {
    nombre: '',
    estado: 'borrador',
    numeroCampos: 1,
    region: '',
    ciudad: '',
    mapsLink: '',
    campos: [{
        capacidad: '',
        horaInicio: '09:00',
        horaFin: '22:00',
        precioHora: '',
        fotos: []
    }],
    ubicacion: '',
    latitud: -12.046374,
    longitud: -77.042793,
    descripcion: ''
};

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
})

const MapUpdater = ({ center }) => {
    const map = useMap()
    const validCenter = [
        parseFloat(center[0]) || -12.046374,
        parseFloat(center[1]) || -77.042793
    ]
    map.setView(validCenter)
    return null
}

const ModalAddCancha = ({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
    isEditing = false,
    userRegion = ''
}) => {

    const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    const REGIONES_PERU = regionesPeru;
    const DISTRITOS_PERU = distritosPeru;

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([-12.046374, -77.042793]);

    const preventKeyboardInput = (e) => {
        // Only Allow: tab, escape, enter and arrow keys
        if ([9, 27, 13].indexOf(e.keyCode) !== -1 ||
            // Allow: arrow keys
            (e.keyCode >= 37 && e.keyCode <= 40)) {
            return;
        }
        // Block everything else (including backspace (8) and delete (46))
        e.preventDefault();
    }

    const propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        initialData: PropTypes.object,
        isEditing: PropTypes.bool,
        userRegion: PropTypes.string
    };
    


    const handleImageCompress = async (file) => {
        // Verifica si el archivo es mayor de 1MB
        if (file.size > 1 * 1024 * 1024) {
            const options = {
                maxSizeMB: 1,          // Limita a 1MB
                maxWidthOrHeight: 1920, // Máxima altura o ancho
                useWebWorker: true
            };
    
            try {
                const compressedFile = await imageCompression(file, options);
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(compressedFile);
                });
            } catch (error) {
                console.error("Error compressing image:", error);
                return null;
            }
        } else {
            // Si la imagen ya es menor de 1MB, simplemente la retornamos
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }
    };



    const convertBlobToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };


    const handleImageUpload = async (index, files) => {
        try {
            const currentFotos = formData.campos[index].fotos || [];

            if (currentFotos.length + files.length > 4) {
                alert('Máximo 4 imágenes permitidas por campo');
                return;
            }

            const processedImages = await Promise.all(
                Array.from(files).map(handleImageCompress)
            );

            const validImages = processedImages.filter(Boolean);

            const newCampos = [...formData.campos];
            newCampos[index] = {
                ...newCampos[index],
                fotos: [...currentFotos, ...validImages]
            };

            setFormData(prev => ({
                ...prev,
                campos: newCampos
            }));

        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Error al subir las imágenes');
        }
    };

    const handleCamposChange = (index, field, value) => {
        if (field === 'capacidad') {
            // Convert to number and validate
            const numValue = parseInt(value);

            // Check if it's a valid number
            if (isNaN(numValue)) return;

            // Check if number is even
            if (numValue % 2 !== 0) {
                alert('La capacidad debe ser un número par');
                return;
            }

            // Check range
            if (numValue < 10 || numValue > 24) {
                alert('La capacidad debe estar entre 10 y 24 jugadores');
                return;
            }

            value = numValue;
        }

        const newCampos = [...formData.campos];
        newCampos[index] = { ...newCampos[index], [field]: value };
        setFormData(prev => ({ ...prev, campos: newCampos }));
    }

    const handleRemoveImage = (campoIndex, imageIndex) => {
        const newCampos = [...formData.campos];
        const newFotos = [...newCampos[campoIndex].fotos];
        newFotos.splice(imageIndex, 1);

        newCampos[campoIndex] = {
            ...newCampos[campoIndex],
            fotos: newFotos
        };

        setFormData(prev => ({
            ...prev,
            campos: newCampos
        }));
    };


    const handleNumeroCamposChange = (e) => {
        const num = parseInt(e.target.value)
        setFormData(prev => ({
            ...prev,
            numeroCampos: num,
            campos: Array(num).fill(0).map((_, i) =>
                prev.campos[i] || {
                    capacidad: '',
                    horario: '',
                    precioHora: '',
                    fotos: []
                }
            )
        }))
    }
    useEffect(() => {
        if (!isOpen) {
            setFormData({ ...initialFormState });
            return;
        }

        if (isEditing && initialData) {
            setFormData({
                ...initialData,
                id: initialData.id, // Ensure ID is included
                campos: initialData.campos.map(campo => ({
                    ...campo,
                    fotos: campo.fotos || []
                }))
            });
        } else {
            setFormData({
                ...initialFormState,
                region: userRegion || ''
            });
        }
    }, [isOpen, isEditing, initialData, userRegion]);

    const handleClose = () => {
        if (!loading) {
            onClose()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simplify campos structure for Firestore
            const camposData = formData.campos.map(campo => ({
                capacidad: Number(campo.capacidad),
                horaInicio: campo.horaInicio,
                horaFin: campo.horaFin,
                precioHora: Number(campo.precioHora),
                fotos: campo.fotos || [] // Store array of strings directly
            }));

            const cleanData = {
                ...(isEditing ? { id: formData.id } : {}),
                nombre: formData.nombre.trim(),
                estado: formData.estado,
                numeroCampos: parseInt(formData.numeroCampos),
                region: formData.region.trim(),
                ciudad: formData.ciudad.trim(),
                ubicacion: formData.ubicacion.trim(),
                latitud: Number(formData.latitud),
                longitud: Number(formData.longitud),
                descripcion: formData.descripcion.trim(),
                mapsLink: formData.mapsLink?.trim() || '',
                campos: camposData
            };

            await onSubmit(cleanData);
            onClose();
            setFormData(initialFormState);

        } catch (error) {
            console.error("Error saving form:", error);
            alert('Error al guardar la cancha');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCancha = async (formData) => {
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

    ModalAddCancha.propTypes = propTypes;



    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={handleClose}>
                    <FaTimes />
                </button>

                <h2>{isEditing ? 'Editar Cancha' : 'Añadir Nueva Cancha'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formoverf}>
                        <div className={styles.section}>
                            <h3>Información General</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Nombre del Local</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            nombre: e.target.value
                                        }))}
                                        placeholder="Nombre del establecimiento"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Estado</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            estado: e.target.value
                                        }))}
                                        className={`${styles.estadoSelect} ${styles[formData.estado]}`}
                                        required
                                    >
                                        <option value="borrador">Borrador</option>
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Número de campos</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.numeroCampos}
                                        onChange={handleNumeroCamposChange}
                                        onKeyDown={preventKeyboardInput}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3>Ubicación</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Región</label>
                                    <select
                                        value={formData.region}
                                        onChange={(e) => {
                                            const selectedRegion = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                region: selectedRegion,
                                                ciudad: '',
                                                latitud: regionesPeru.find(r => r.nombre === selectedRegion)?.lat || '',
                                                longitud: regionesPeru.find(r => r.nombre === selectedRegion)?.lng || ''
                                            }))
                                        }}
                                        required
                                    >
                                        <option value="">Selecciona una región</option>
                                        {regionesPeru.map(region => (
                                            <option key={region.nombre} value={region.nombre}>
                                                {region.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>


                                <div className={styles.formGroup}>
                                    <label>Ciudad/Provincia</label>
                                    <select
                                        value={formData.ciudad}
                                        onChange={(e) => {
                                            const selectedCity = DISTRITOS_PERU[formData.region]?.find(
                                                city => city.nombre === e.target.value
                                            );
                                            setFormData(prev => ({
                                                ...prev,
                                                ciudad: e.target.value,
                                                latitud: selectedCity?.lat || prev.latitud,
                                                longitud: selectedCity?.lng || prev.longitud
                                            }))
                                        }}
                                        disabled={!formData.region}
                                        required
                                    >
                                        <option value="">Selecciona una ciudad</option>
                                        {formData.region && DISTRITOS_PERU[formData.region]?.map(ciudad => (
                                            <option key={ciudad.nombre} value={ciudad.nombre}>
                                                {ciudad.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        value={formData.ubicacion}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            ubicacion: e.target.value
                                        }))}
                                        placeholder="Av. Example 123"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Link de Google Maps (opcional)</label>
                                    <input
                                        type="url"
                                        value={formData.mapsLink}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            mapsLink: e.target.value
                                        }))}
                                        placeholder="https://maps.google.com/..."
                                    />
                                </div>


                                <div className={styles.coordsGroup}>
                                    <div className={styles.formGroup}>
                                        <label>Latitud</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.latitud}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                latitud: e.target.value
                                            }))}
                                            onKeyDown={preventKeyboardInput}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Longitud</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.longitud}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                longitud: e.target.value
                                            }))}
                                            onKeyDown={preventKeyboardInput}
                                            required
                                        />
                                    </div>

                                </div>
                            </div>
                            <div className={styles.mapSection}>
                                <MapContainer
                                    center={[
                                        parseFloat(formData.latitud) || -12.046374,
                                        parseFloat(formData.longitud) || -77.042793
                                    ]}
                                    zoom={13}
                                    style={{ height: '250px', width: '100%', borderRadius: '12px' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker
                                        position={[
                                            parseFloat(formData.latitud) || -12.046374,
                                            parseFloat(formData.longitud) || -77.042793
                                        ]}
                                        draggable={true}
                                        icon={customIcon}
                                        eventHandlers={{
                                            dragend: (e) => {
                                                const marker = e.target
                                                const position = marker.getLatLng()
                                                setFormData(prev => ({
                                                    ...prev,
                                                    latitud: position.lat,
                                                    longitud: position.lng
                                                }))
                                            }
                                        }}
                                    />
                                    <MapUpdater center={[parseFloat(formData.latitud), parseFloat(formData.longitud)]} />
                                </MapContainer>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3>Campos Deportivos</h3>
                            {formData.campos.map((campo, index) => (
                                <div key={index} className={styles.campoCard}>
                                    <h4>Campo {index + 1}</h4>
                                    <div className={styles.campoGrid}>
                                        <div className={styles.formGroup}>

                                            <label>Capacidad máxima de jugadores (10-24, números pares)</label>
                                            <small className={styles.helpText}>
                                                Solo números pares entre 10 y 24 jugadores
                                            </small>
                                            <input
                                                type="number"
                                                min="10"
                                                max="24"
                                                step="2"
                                                value={campo.capacidad}
                                                onChange={(e) => handleCamposChange(index, 'capacidad', e.target.value)}
                                                onBlur={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    if (value < 10) e.target.value = "10";
                                                    if (value > 24) e.target.value = "24";
                                                    handleCamposChange(index, 'capacidad', e.target.value);
                                                }}
                                                required
                                                onKeyDown={preventKeyboardInput}
                                                placeholder="Ej: 10, 12, 14..."
                                            />

                                        </div>
                                        <div className={styles.timeGroup}>
                                            <div className={styles.formGroup}>
                                                <label>Hora inicio</label>
                                                <input
                                                    type="time"
                                                    value={campo.horaInicio}
                                                    onChange={(e) => handleCamposChange(index, 'horaInicio', e.target.value)}
                                                    required
                                                    onKeyDown={preventKeyboardInput}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Hora fin</label>
                                                <input
                                                    type="time"
                                                    value={campo.horaFin}
                                                    onChange={(e) => handleCamposChange(index, 'horaFin', e.target.value)}
                                                    required
                                                    onKeyDown={preventKeyboardInput}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Precio por hora (S/)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={campo.precioHora}
                                                onChange={(e) => handleCamposChange(index, 'precioHora', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className={styles.imageUploadSection}>
                                            <label>Fotos del campo</label>
                                            <div className={styles.uploadWrapper}>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(e) => handleImageUpload(index, Array.from(e.target.files))}
                                                    id={`campo-${index}-fotos`}
                                                    hidden
                                                />
                                                <label htmlFor={`campo-${index}-fotos`} className={styles.uploadButton}>
                                                    <FaImage /> Seleccionar imágenes
                                                </label>
                                            </div>
                                            <div className={styles.previewGrid}>
                                                {campo.fotos?.map((foto, i) => (
                                                    <div key={i} className={styles.previewItem}>
                                                        <img
                                                            src={foto}
                                                            alt={`Preview ${i + 1}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={styles.removeImage}
                                                            onClick={() => handleRemoveImage(index, i)}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.section}>
                            <div className={styles.formGroup}>
                                <label>Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        descripcion: e.target.value
                                    }))}
                                    rows={4}
                                    placeholder="Describe las características de tus campos..."
                                    required
                                />
                            </div>
                        </div>

                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={handleClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cancha'}
                        </button>
                    </div>
                </form>
            </div>

        </div>

    )
}



export default ModalAddCancha