'use client'

import { motion } from 'framer-motion'
import styles from './Beneficios.module.css'

const benefits = [
  {
    title: 'Aprendizaje Personalizado',
    description: 'La IA se adapta a tu ritmo y estilo de aprendizaje, enfocándose en tus áreas de mejora.',
    icon: '🎓'
  },
  {
    title: 'Ahorra Tiempo',
    description: 'No más buscando en internet. La IA responde exactamente sobre tus materiales.',
    icon: '⏱️'
  },
  {
    title: 'Prepárate Mejor',
    description: 'Conoce tus debilidades antes del examen y enfócate en lo que realmente importa.',
    icon: '📝'
  },
  {
    title: 'Acceso 24/7',
    description: 'Tu asistente de estudio está disponible en cualquier momento, día o noche.',
    icon: '🌙'
  }
]

export default function Beneficios() {
  return (
    <section id="beneficios" className={styles.section}>
      <div className={styles.background}>
        <div className={styles.gradient}></div>
      </div>
      
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className={styles.tag}>Beneficios</span>
          <h2 className={styles.title}>¿Por qué elegir AcademIA?</h2>
          <p className={styles.subtitle}>Transforma tu forma de estudiar con tecnología de punta</p>
        </motion.div>

        <div className={styles.grid}>
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              className={styles.card}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <span className={styles.icon}>{benefit.icon}</span>
              <h3 className={styles.cardTitle}>{benefit.title}</h3>
              <p className={styles.cardDescription}>{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
