'use client'

import { motion } from 'framer-motion'
import styles from './Funcionalidades.module.css'

const features = [
  {
    icon: '📚',
    title: 'Carga de Materiales',
    description: 'Sube tus PDFs, documentos Word, imágenes y más. Nuestra IA procesa y organiza todo tu material de estudio automáticamente.'
  },
  {
    icon: '🧠',
    title: 'Análisis con IA',
    description: 'Gemini 2.5 Flash analiza tu documentación y evalúa tu comprensión mediante preguntas inteligentes y ejercicios adaptativos.'
  },
  {
    icon: '📊',
    title: 'Métricas en Tiempo Real',
    description: 'Visualiza tu progreso con dashboards interactivos. Conoce tu nivel de comprensión por tema y área de estudio.'
  },
  {
    icon: '🎯',
    title: 'Detección de Debilidades',
    description: 'La plataforma identifica automáticamente los temas donde tienes dificultades y te sugiere qué repasar.'
  },
  {
    icon: '💬',
    title: 'Asistente RAG',
    description: 'Pregunta lo que quieras sobre tus materiales. La IA responde exclusivamente basándose en tu documentación cargada.'
  },
  {
    icon: '📈',
    title: 'Predicción de Éxito',
    description: 'Conoce tus probabilidades de aprobar antes del examen basándote en tu desempeño actual y histórico.'
  }
]

export default function Funcionalidades() {
  return (
    <section id="funcionalidades" className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className={styles.tag}>Funcionalidades</span>
          <h2 className={styles.title}>Todo lo que necesitas para aprobar</h2>
          <p className={styles.subtitle}>Herramientas poderosas diseñadas para maximizar tu rendimiento académico</p>
        </motion.div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{feature.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
