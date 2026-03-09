'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        <div className={styles.gradient1}></div>
        <div className={styles.gradient2}></div>
        <div className={styles.pattern}></div>
      </div>
      
      <div className={styles.container}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.badge}>✨ Impulsado por Inteligencia Artificial</span>
          
          <h1 className={styles.title}>
            Aprende de forma <span className={styles.highlight}>inteligente</span> con AcademIA
          </h1>
          
          <p className={styles.subtitle}>
            La plataforma que analiza tu desempeño académico, detecta tus debilidades y te ayuda a mejorar antes de tu evaluación final. Carga tus materiales de estudio y deja que la IA haga el resto.
          </p>
          
          <div className={styles.ctas}>
            <Link href="/registro" className={styles.primaryBtn}>
              Comenzar Gratis <span className={styles.arrow}>→</span>
            </Link>
            <Link href="#como-funciona" className={styles.secondaryBtn}>Ver cómo funciona</Link>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Estudiantes</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>95%</span>
              <span className={styles.statLabel}>Mejora en notas</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Instituciones</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.mockup}>
            <div className={styles.mockupHeader}>
              <div className={styles.dots}>
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className={styles.mockupContent}>
              <div className={styles.aiMessage}>
                <div className={styles.aiIcon}>🤖</div>
                <div className={styles.messageText}>
                  <p>He detectado que tienes dificultades en <strong>Análisis de Algoritmos</strong>. Te recomiendo repasar los temas de complejidad temporal antes de tu examen.</p>
                </div>
              </div>
              <div className={styles.progressCard}>
                <h4>Tu Progreso</h4>
                <div className={styles.progressBar}><div className={styles.progressFill}></div></div>
                <p>78% de comprensión global</p>
              </div>
              <div className={styles.metricCards}>
                <div className={styles.metricCard}>
                  <span className={styles.metricIcon}>📊</span>
                  <span className={styles.metricValue}>85%</span>
                  <span className={styles.metricLabel}>Retención</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricIcon}>🎯</span>
                  <span className={styles.metricValue}>12</span>
                  <span className={styles.metricLabel}>Débilidades</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
