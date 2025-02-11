import React from 'react'
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa'
import styles from './Tbcanchas.module.css'

const TbCanchas = ({ canchas, onAdd, onEdit, onDelete }) => {


    const formatDate = (dateValue) => {
        if (!dateValue) return '-'

        try {
            // If it's a string (ISO format)
            if (typeof dateValue === 'string') {
                return new Date(dateValue).toLocaleDateString()
            }
            // If it's a Firestore Timestamp
            if (dateValue.toDate) {
                return dateValue.toDate().toLocaleDateString()
            }
            // If it's already a Date object
            if (dateValue instanceof Date) {
                return dateValue.toLocaleDateString()
            }
            return '-'
        } catch (error) {
            console.error('Error formatting date:', error)
            return '-'
        }
    }

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
                <h2>Mis Canchas</h2>
                <button className={styles.addButton} onClick={onAdd}>
                    <FaPlus /> Añadir Cancha
                </button>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Región</th>
                            <th>Ubicación</th>
                            <th>N° Campos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {canchas?.map(cancha => (
                            <tr key={cancha.id}>
                                <td data-label="ID">{cancha.id.substring(0, 8)}</td>
                                <td data-label="Fecha">{formatDate(cancha.createdAt)}</td>
                                <td data-label="Nombre">{cancha.nombre}</td>
                                <td data-label="Estado">
                                    <span className={`${styles.status} ${styles[cancha.estado]}`}>
                                        {cancha.estado}
                                    </span>
                                </td>
                                <td data-label="Región">{cancha.region}</td>
                                <td data-label="Ubicación">{cancha.ubicacion}</td>
                                <td data-label="N° Campos">{cancha.numeroCampos}</td>
                                <td data-label="Acciones" className={styles.actions}>
                                    <button onClick={() => onEdit(cancha)}><FaPencilAlt /></button>
                                    <button onClick={() => onDelete(cancha.id)}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TbCanchas