import React, { useState, useEffect } from 'react'
import { FaTimes, FaImage } from 'react-icons/fa'
import imageCompression from 'browser-image-compression'
import PropTypes from 'prop-types'
import styles from './ModalAddCancha.module.css'

const ModalAddCancha = ({ isOpen, onClose, onSubmit, initialData = null, isEditing = false }) => {
    const initialFormState = {
        estado: 'borrador',
        numeroCampos: 1,
        campos: [{
            capacidad: '',
            horaInicio: '09:00',
            horaFin: '22:00',
            precioHora: '',
            fotos: [],
            fotosPreview: []
        }],
        ubicacion: '',
        latitud: '',
        longitud: '',
        descripcion: ''
    }

    const [formData, setFormData] = useState(initialFormState)
    const [loading, setLoading] = useState(false)

    const handleImageCompress = async (file) => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024
        }
        try {
            return await imageCompression(file, options)
        } catch (error) {
            console.error("Error compressing image:", error)
            return null
        }
    }
    const handleImageUpload = async (index, files) => {
        const compressedFiles = []
        const previews = []
        const currentFiles = formData.campos[index].fotos || []
        const currentPreviews = formData.campos[index].fotosPreview || []

        // Check if adding new files would exceed limit
        if (currentFiles.length + files.length > 4) {
            alert('Máximo 4 imágenes permitidas')
            return
        }

        for (const file of files) {
            const compressed = await handleImageCompress(file)
            if (compressed) {
                compressedFiles.push(compressed)
                previews.push(URL.createObjectURL(compressed))
            }
        }

        const newCampos = [...formData.campos]
        newCampos[index] = {
            ...newCampos[index],
            fotos: [...currentFiles, ...compressedFiles],
            fotosPreview: [...currentPreviews, ...previews]
        }
        setFormData(prev => ({ ...prev, campos: newCampos }))
    }

    const handleCamposChange = (index, field, value) => {
        const newCampos = [...formData.campos]
        newCampos[index] = { ...newCampos[index], [field]: value }
        setFormData(prev => ({ ...prev, campos: newCampos }))
    }

    const handleRemoveImage = (campoIndex, imageIndex) => {
        const newCampos = [...formData.campos]
        const newFotos = [...newCampos[campoIndex].fotos]
        const newPreviews = [...newCampos[campoIndex].fotosPreview]

        newFotos.splice(imageIndex, 1)
        newPreviews.splice(imageIndex, 1)

        newCampos[campoIndex] = {
            ...newCampos[campoIndex],
            fotos: newFotos,
            fotosPreview: newPreviews
        }

        setFormData(prev => ({ ...prev, campos: newCampos }))
    }


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
        if (isEditing && initialData) {
            setFormData({
                ...initialData,
                campos: initialData.campos.map(campo => ({
                    ...campo,
                    fotosPreview: Array.isArray(campo.fotos) ? campo.fotos : [],
                    fotos: []
                }))
            })
        } else {
            setFormData(initialFormState)
        }
    }, [isEditing, initialData])


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validate required fields
            if (!formData.ubicacion || !formData.latitud || !formData.longitud || !formData.descripcion) {
                throw new Error('Todos los campos son requeridos')
            }

            // Validate each campo
            const camposValid = formData.campos.every(campo =>
                campo.capacidad &&
                campo.horaInicio &&
                campo.horaFin &&
                campo.precioHora &&
                (isEditing ? true : campo.fotos.length > 0) // Skip foto validation if editing
            )

            if (!camposValid) {
                throw new Error('Complete todos los datos de los campos')
            }

            // Process images and submit
            const camposProcessed = await Promise.all(formData.campos.map(async (campo) => {
                const fotosToProcess = campo.fotos.filter(foto => foto instanceof File)
                const existingFotos = Array.isArray(campo.fotosPreview) ?
                    campo.fotosPreview.filter(foto => typeof foto === 'string') : []

                const newFotosBase64 = await Promise.all(fotosToProcess.map(async (foto) => {
                    const buffer = await foto.arrayBuffer()
                    const base64 = btoa(
                        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
                    )
                    return `data:${foto.type};base64,${base64}`
                }))

                return {
                    capacidad: parseInt(campo.capacidad),
                    horaInicio: campo.horaInicio,
                    horaFin: campo.horaFin,
                    precioHora: parseFloat(campo.precioHora),
                    fotos: [...existingFotos, ...newFotosBase64]
                }
            }))

            const dataToSubmit = {
                estado: formData.estado,
                numeroCampos: parseInt(formData.numeroCampos),
                ubicacion: formData.ubicacion,
                latitud: parseFloat(formData.latitud),
                longitud: parseFloat(formData.longitud),
                descripcion: formData.descripcion,
                campos: camposProcessed
            }

            await onSubmit(dataToSubmit)
            onClose()
        } catch (error) {
            console.error("Error processing form:", error)
            alert(error.message || 'Error al guardar la cancha. Por favor intente nuevamente.')
        } finally {
            setLoading(false)
        }
    }
    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes />
                </button>

                <h2>{isEditing ? 'Editar Cancha' : 'Añadir Nueva Cancha'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formoverf}>
                        <div className={styles.section}>

                            <h3>Información General</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Estado</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            estado: e.target.value
                                        }))}
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
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3>Ubicación</h3>
                            <div className={styles.formGrid}>
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
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3>Campos Deportivos</h3>
                            {formData.campos.map((campo, index) => (
                                <div key={index} className={styles.campoCard}>
                                    <h4>Campo {index + 1}</h4>
                                    <div className={styles.campoGrid}>
                                        <div className={styles.formGroup}>
                                            <label>Capacidad de jugadores</label>
                                            <input
                                                type="number"
                                                min="2"
                                                value={campo.capacidad}
                                                onChange={(e) => handleCamposChange(index, 'capacidad', e.target.value)}
                                                required
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
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Hora fin</label>
                                                <input
                                                    type="time"
                                                    value={campo.horaFin}
                                                    onChange={(e) => handleCamposChange(index, 'horaFin', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Precio por hora (S/)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
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
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(index, Array.from(e.target.files))}
                                                    id={`campo-${index}-fotos`}
                                                    hidden
                                                />
                                                <label htmlFor={`campo-${index}-fotos`} className={styles.uploadButton}>
                                                    <FaImage /> Seleccionar imágenes
                                                </label>
                                            </div>
                                            <div className={styles.previewGrid}>
                                                {campo.fotosPreview?.map((preview, i) => (
                                                    <div key={i} className={styles.previewItem}>
                                                        <img src={preview} alt={`Preview ${i + 1}`} />
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
                        <button type="button" onClick={onClose} disabled={loading}>
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

ModalAddCancha.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    isEditing: PropTypes.bool
}

export default ModalAddCancha