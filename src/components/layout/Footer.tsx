import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🎓</span>
              <span className={styles.logoText}>AcademIA</span>
            </div>
            <p className={styles.tagline}>Transformando el aprendizaje con inteligencia artificial</p>
          </div>

          <div className={styles.links}>
            <div className={styles.column}>
              <h4>Producto</h4>
              <Link href="#funcionalidades">Funcionalidades</Link>
              <Link href="#como-funciona">Cómo Funciona</Link>
              <Link href="#precios">Precios</Link>
            </div>
            <div className={styles.column}>
              <h4>Empresa</h4>
              <Link href="#sobre-nosotros">Sobre Nosotros</Link>
              <Link href="#blog">Blog</Link>
              <Link href="#careers">Carreras</Link>
            </div>
            <div className={styles.column}>
              <h4>Soporte</h4>
              <Link href="#ayuda">Centro de Ayuda</Link>
              <Link href="#contacto">Contacto</Link>
              <Link href="#faq">FAQ</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; 2024 AcademIA. Todos los derechos reservados.</p>
          <div className={styles.legal}>
            <Link href="#privacidad">Política de Privacidad</Link>
            <Link href="#terminos">Términos de Servicio</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
