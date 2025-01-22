import { Link } from 'react-router-dom'
import React from 'react'
import styles from './Home.module.css'
import Navbar from '../../Components/Navbar/Navbar'
import { FaSearch, FaHeart, FaFootballBall, FaUsers, FaClock, FaPlusCircle } from 'react-icons/fa'
import { FaUserFriends, FaShareAlt, FaCheckCircle, FaWhatsapp } from 'react-icons/fa'
import { MdSpaceDashboard } from "react-icons/md";
import { useEffect, useState } from 'react'


import camphome1 from '../../assets/img/img-camp1.jpg'
import camphome2 from '../../assets/img/img-camp2.jpg'
import camphome3 from '../../assets/img/img-camp3.jpg'
import benef1 from '../../assets/img/img-benf1.png'
import benef2 from '../../assets/img/img-benf2.png'


function Home() {

    const departments = [
        { name: 'Lima', image: camphome1, fields: 150 },
        { name: 'Arequipa', image: camphome2, fields: 80 },
        { name: 'Cusco', image: camphome3, fields: 65 },
        { name: 'Trujillo', image: camphome1, fields: 45 },
        { name: 'Piura', image: camphome2, fields: 40 },
        { name: 'Chiclayo', image: camphome3, fields: 35 },
        { name: 'Ica', image: camphome1, fields: 30 },
        { name: 'Tacna', image: camphome2, fields: 25 },
    ];

    const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const positions = [
            // Team 1 positions
            { x: '50%', y: '85%' }, // goalkeeper 1
            { x: '30%', y: '65%' }, // defender 1
            { x: '50%', y: '65%' }, // defender 2
            { x: '70%', y: '65%' }, // defender 3
            { x: '25%', y: '45%' }, // midfielder 1
            { x: '75%', y: '45%' }, // midfielder 2
            // Team 2 positions
            { x: '50%', y: '15%' }, // goalkeeper 2
            { x: '30%', y: '35%' }, // defender 1
            { x: '50%', y: '35%' }, // defender 2
            { x: '70%', y: '35%' }, // defender 3
            { x: '25%', y: '55%' }, // midfielder 1
            { x: '75%', y: '55%' }  // midfielder 2
        ];

        let currentPos = 0
        const interval = setInterval(() => {
            currentPos = (currentPos + 1) % positions.length
            setBallPosition(positions[currentPos])
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <Navbar />
            <div className={styles.homeContainer}>
                <div className={styles.leftContent}>
                    <h1>Encuentra la cancha para tus pichangas</h1>
                    <p>Play place facilita el alquiler y ofrecimiento de canchas de fútbol.</p>
                    <button className={styles.searchButton}>
                        <FaSearch className={styles.searchIcon} />
                        <span>Buscar Canchas</span>
                    </button>                </div>
                <div className={styles.rightContent}>
                    <div className={styles.imageGrid}>
                        <div className={styles.leftImages}>
                            <img src={camphome1} alt="Property 1" />
                            <img src={camphome2} alt="Property 2" />
                        </div>
                        <div className={styles.rightImage}>
                            <img src={camphome3} alt="Property 3" />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.servicesContainer}>
                <div className={styles.serviceCard}>
                    <h3>Alquilar una cancha</h3>
                    <img src={benef1} alt="Alquilar cancha" />
                    <p>
                        Encuentra la cancha perfecta para tu pichanga.
                        Compara precios, revisa la disponibilidad y
                        reserva al instante. Todo desde un solo lugar.
                    </p>
                    <button className={styles.button3}>
                        <FaSearch className={styles.searchIcon} />
                        <span>Buscar Cancha</span>
                    </button>
                </div>

                <div className={styles.serviceCard}>
                    <h3>Ofrecer mi cancha</h3>
                    <img src={benef2} alt="Ofrecer cancha" />
                    <p>
                        Gestiona tu negocio de manera eficiente.
                        Aumenta la visibilidad de tu cancha y
                        maximiza tus reservas con nuestra plataforma.
                    </p>
                    <button className={styles.offerButton}>
                        <FaPlusCircle className={styles.searchIcon} />
                        <span>Añadir Anuncio</span>
                    </button>
                </div>
            </div>

            <div className={styles.featuredContainer}>
                <h2>Canchas Destacadas en Chincha Alta</h2>
                <p>Encuentra las mejores canchas de fútbol cercanas a ti</p>

                <div className={styles.fieldsGrid}>
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className={styles.fieldCard}>
                            <div className={styles.imageSection}>
                                <img src={camphome1} alt={`Field ${index + 1}`} />
                                <button className={styles.likeButton}>
                                    <FaHeart />
                                </button>
                            </div>

                            <div className={styles.fieldInfo}>
                                <div className={styles.priceTag}>
                                    <span className={styles.price}>S/.50</span>
                                    <span className={styles.unit}> x hora</span>
                                </div>

                                <div className={styles.features}>
                                    <div>
                                        <MdSpaceDashboard /> 2 campos
                                    </div>
                                    <div>
                                        <FaUsers /> 12 jugadores
                                    </div>
                                    <div>
                                        <FaClock /> 10am - 10pm
                                    </div>
                                </div>

                                <h3>Cancha La Victoria</h3>
                                <span className={styles.fieldId}>ID: 08A2K2</span>
                            </div>
                        </div>
                    ))}
                </div>

                <button className={styles.searchButton2}>
                    <FaSearch className={styles.searchIcon} />
                    <span>Buscar Canchas</span>
                </button>
            </div>


            <div className={styles.regionsContainer}>
                <h2>Buscar por región</h2>
                <p>Busca canchas por regiones del Perú</p>

                <div className={styles.regionsGrid}>
                    {departments.map((dept, index) => (
                        <div key={index} className={styles.regionCard}>
                            <div className={styles.regionImageContainer}>
                                <img src={dept.image} alt={dept.name} />
                            </div>
                            <h3>{dept.name}</h3>
                            <p>{dept.fields} canchas registradas</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.teamManagerContainer}>
                <div className={styles.tmContent}>
                    <h2>Organiza tu pichanga como un pro</h2>
                    <p>Invita amigos, confirma asistencias y arma tu equipo en segundos</p>

                    <div className={styles.benefitsList}>
                        <div className={styles.benefitItem}>
                            <FaShareAlt />
                            <span>Comparte el link por WhatsApp</span>
                        </div>
                        <div className={styles.benefitItem}>
                            <FaCheckCircle />
                            <span>Confirma asistencias en tiempo real</span>
                        </div>
                        <div className={styles.benefitItem}>
                            <FaUserFriends />
                            <span>Organiza equipos automáticamente</span>
                        </div>
                    </div>

                    <button className={styles.registerButton}>
                        <FaUserFriends />
                        <span>Únete a la comunidad</span>
                    </button>
                </div>

                <div className={styles.tmPreview}>
                    <div className={styles.phoneFrame}>
                        <div className={styles.demoScreen}>
                            <h4>Asistencia</h4>
                            <div className={styles.playersList}>
                                <div className={styles.playersList}>
                                    <div className={styles.playerConfirmed}>
                                        <div className={styles.playerAvatar}>
                                            <img src={`https://i.pravatar.cc/150?img=1`} alt="avatar" />
                                        </div>
                                        <FaCheckCircle /> Ernesto Lev
                                    </div>
                                    <div className={styles.playerPending}>
                                        <div className={styles.playerAvatar}>
                                            <img src={`https://i.pravatar.cc/150?img=2`} alt="avatar" />
                                        </div>
                                        Maximo Vicenzo
                                    </div>
                                    <div className={styles.playerConfirmed}>
                                        <div className={styles.playerAvatar}>
                                            <img src={`https://i.pravatar.cc/150?img=3`} alt="avatar" />
                                        </div>
                                        <FaCheckCircle /> Victor Angulo
                                    </div>
                                </div>
                                <div className={styles.soccerField}>
                                    <div className={styles.fieldLines}>
                                        <div className={styles.centerCircle}></div>
                                        <div className={styles.centerLine}></div>
                                        <div className={styles.formation}>
                                            <div className={styles.ball} style={{
                                                left: ballPosition.x,
                                                top: ballPosition.y
                                            }}></div>

                                            {/* Team 1 */}
                                            <div className={styles.team1}>
                                                <div className={`${styles.player} ${styles.goalkeeper}`}>
                                                    <img src={`https://i.pravatar.cc/150?img=4`} alt="goalkeeper" />
                                                </div>
                                                <div className={styles.defenseLine}>
                                                    {[5, 6, 7].map(num => (
                                                        <div key={num} className={`${styles.player} ${styles.defender}`}>
                                                            <img src={`https://i.pravatar.cc/150?img=${num}`} alt="defender" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className={styles.midLine}>
                                                    {[8, 9].map(num => (
                                                        <div key={num} className={`${styles.player} ${styles.midfielder}`}>
                                                            <img src={`https://i.pravatar.cc/150?img=${num}`} alt="midfielder" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Team 2 */}
                                            <div className={styles.team2}>
                                                <div className={`${styles.player} ${styles.goalkeeper}`}>
                                                    <img src={`https://i.pravatar.cc/150?img=10`} alt="goalkeeper" />
                                                </div>
                                                <div className={styles.defenseLine}>
                                                    {[11, 12, 13].map(num => (
                                                        <div key={num} className={`${styles.player} ${styles.defender}`}>
                                                            <img src={`https://i.pravatar.cc/150?img=${num}`} alt="defender" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className={styles.midLine}>
                                                    {[14, 15].map(num => (
                                                        <div key={num} className={`${styles.player} ${styles.midfielder}`}>
                                                            <img src={`https://i.pravatar.cc/150?img=${num}`} alt="midfielder" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default Home