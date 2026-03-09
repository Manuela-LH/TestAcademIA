import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
    title: 'AcademIA - Tu Asistente de Aprendizaje con IA',
    description: 'Plataforma de aprendizaje inteligente que analiza tu desempeño y te ayuda a mejorar tu comprensión mediante IA avanzada.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    )
}
