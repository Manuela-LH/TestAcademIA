'use client'

import { motion } from 'framer-motion'
import styles from './ComoFunciona.module.css'

const steps = [
  {
    number: '01',
    title: 'Crea tu Cuenta',
    description: 'Regístrate en segundos con tu correo institucional o redes sociales. Es completamente gratis.'
  },
  {
    number: '02',
    title: 'Carga tus Materiales',
    description: 'Sube PDFs, documentos, presentaciones o imágenes de tus apuntes. Soportamos múltiples formatos.'
  },
  {
    number: '03',
    title: 'La IA Procesa',
    description: 'Nuestro sistema RAG transforma tus documentos en conocimiento estructurado y busca respuestas precisas.'
  },
  {
    number: '04',
    title: 'Aprende y Mejora',
    description: 'Recibe análisis personalizados, detecta tus debilidades y prepárate efectivamente para tus exámenes.'
  }
]

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className={styles.tag}>Cómo Funciona</span>
          <h2 className={styles.title}>En 4 simples pasos</h2>
        </motion.div>

        <div className={styles.steps}>
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className={styles.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className={styles.connector}></div>}
            </motion.div>
          ))}
        </div>

        <motion.div 
          className={styles.diagram}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className={styles.diagramCard}>
            <span className={styles.diagramIcon}>📄</span>
            <span>Materiales</span>
          </div>
          <div className={styles.diagramArrow}>→</div>
          <div className={styles.diagramCard}>
            <span className={styles.diagramIcon}>🔄</span>
            <span>Procesamiento RAG</span>
          </div>
          <div className={styles.diagramArrow}>→</div>
          <div className={styles.diagramCard}>
            <span className={styles.diagramIcon}>🧠</span>
            <span>IA + Gemini</span>
          </div>
          <div className={styles.diagramArrow}>→</div>
          <div className={styles.diagramCard}>
            <span className={styles.diagramIcon}>📊</span>
            <span>Resultados</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
