import React, { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './PasswordModal.module.css';

const PasswordModal = ({ isOpen, onClose, onSubmit, isUpdate }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [errors, setErrors] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const validatePassword = (password) => {
        if (!password) return 'La contraseña es requerida';
        if (!/[A-Z]/.test(password)) return 'La contraseña debe tener al menos una mayúscula';
        if (!/[0-9]/.test(password)) return 'La contraseña debe tener al menos un número';
        if (!/[!@#$%^&*]/.test(password)) return 'La contraseña debe tener al menos un caracter especial (!@#$%^&*)';
        return '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validaciones
        const newPasswordError = validatePassword(formData.newPassword);
        if (newPasswordError) {
            setErrors(prev => ({ ...prev, newPassword: newPasswordError }));
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setErrors(prev => ({ 
                ...prev, 
                confirmPassword: 'Las contraseñas no coinciden' 
            }));
            return;
        }

        setErrors({ newPassword: '', confirmPassword: '' });
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes />
                </button>
                <h2>{isUpdate ? 'Actualizar Contraseña' : 'Configurar Contraseña'}</h2>
                <form onSubmit={handleSubmit}>
                    {isUpdate && (
                        <div className={styles.inputGroup}>
                            <label>Contraseña actual</label>
                            <div className={styles.passwordInput}>
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        currentPassword: e.target.value
                                    }))}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPasswords(prev => ({
                                        ...prev,
                                        current: !prev.current
                                    }))}
                                >
                                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className={styles.inputGroup}>
                        <label>Nueva contraseña</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        newPassword: e.target.value
                                    }));
                                    setErrors(prev => ({
                                        ...prev,
                                        newPassword: validatePassword(e.target.value)
                                    }));
                                }}
                                required
                            />
                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() => setShowPasswords(prev => ({
                                    ...prev,
                                    new: !prev.new
                                }))}
                            >
                                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.newPassword && <span className={styles.errorText}>{errors.newPassword}</span>}
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Confirmar contraseña</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        confirmPassword: e.target.value
                                    }));
                                    if (e.target.value !== formData.newPassword) {
                                        setErrors(prev => ({
                                            ...prev,
                                            confirmPassword: 'Las contraseñas no coinciden'
                                        }));
                                    } else {
                                        setErrors(prev => ({
                                            ...prev,
                                            confirmPassword: ''
                                        }));
                                    }
                                }}
                                required
                            />
                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() => setShowPasswords(prev => ({
                                    ...prev,
                                    confirm: !prev.confirm
                                }))}
                            >
                                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        {isUpdate ? 'Actualizar' : 'Configurar'}
                    </button>
                </form>
            </div>
            <div className={styles.overlay} onClick={onClose} />
        </>
    );
};

export default PasswordModal;