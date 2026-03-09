'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import styles from './Cta.module.css'

export default function Cta() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>¿Listo para transformar tu aprendizaje?</h2>
          <p className={styles.subtitle}>
            Únete a miles de estudiantes que ya están mejorando su rendimiento académico con AcademIA
          </p>
          <div className={styles.ctas}>
            <Link href="/registro" className={styles.primaryBtn}>Comenzar Gratis Ahora</Link>
            <span className={styles.note}>Sin tarjeta de crédito</span>
          </div>
          <div className={styles.features}>
            <span>✓ Acceso inmediato</span>
            <span>✓ Materiales ilimitados</span>
            <span>✓ Soporte 24/7</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
