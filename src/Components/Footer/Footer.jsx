import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaTwitter } from 'react-icons/fa'

import logo from '../../assets/img/logo-prin2.png'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.logo}>
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        <div className={styles.rightSection}>
          <nav className={styles.footerNav}>
            <Link to="/about">Acerca de</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contacto</Link>
            <Link to="/terms">Términos y servicios</Link>
          </nav>

          <div className={styles.socialLinks}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
              <FaTiktok />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.companyInfo}>
        <div>© 2024 Play Place. Todos los derechos reservados.</div>
        <div>
          Play Place<br />
          +51 937007562 <br />
          ermarlevh04@gmail.com<br />
          Lima, Perú
        </div>
      </div>
    </footer>
  )
}

export default Footer