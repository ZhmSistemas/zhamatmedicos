'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Award,
  Droplets,
  FlaskConical,
  Heart,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react'

// --------------- Scroll-triggered animation wrapper ---------------
function AnimatedSection({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

// --------------- Metric card ---------------
interface MetricCardProps {
  icon: React.ReactNode
  title: string
  description: string
  benefit: string
  iconWrapperClass: string
  accentClass: string
  accentIconClass: string
}

function MetricCard({
  icon,
  title,
  description,
  benefit,
  iconWrapperClass,
  accentClass,
  accentIconClass,
}: MetricCardProps) {
  return (
    <div className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div
        className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 ${iconWrapperClass}`}
      >
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-gray-800">{title}</h3>
      <p className="mb-6 leading-relaxed text-gray-600">{description}</p>
      <div className={`flex items-start gap-3 rounded-xl border-l-4 p-4 ${accentClass}`}>
        <TrendingUp className={`mt-0.5 h-5 w-5 shrink-0 ${accentIconClass}`} />
        <p className="text-sm leading-relaxed text-gray-700">{benefit}</p>
      </div>
    </div>
  )
}

// ===================================================================
//  MAIN COMPONENT
// ===================================================================
export default function ProductShowcase() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-emerald-50 via-white to-stone-50">
      {/* ---------- decorative blobs ---------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-amber-100/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        {/* ---------- HEADER ---------- */}
        <AnimatedSection className="mb-16 lg:mb-24 sectionone">
          <div className="grid items-center gap-12 lg:grid-cols-4">
            {/* video */}
            <div className="items-center justify-center lg:col-span-1 lg:flex">
              <video
                src="https://res.cloudinary.com/dc7hpxqys/video/upload/q_auto/f_auto/v1779567400/zhamatmedicos_logo_e7yhso.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-auto"
              />
            </div>

            {/* text */}
            <div className="text-center lg:col-span-3 lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                <Shield className="h-4 w-4" />
                Seguimiento Integral de Pacientes
              </div>

              <h1 className="mb-6 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Acompañamiento Personalizado para{' '}
                <span className="bg-linear-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  tu Salud 
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl lg:mx-0">
                Realizamos un seguimiento continuo de tu salud para comprobar la efectividad de los productos que consumes. Monitoreamos tres parámetros clave que nos permiten brindarte un acompañamiento cercano, preciso y verdaderamente personalizado.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* ---------- METRICS GRID ---------- */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:mb-24 lg:grid-cols-3">
          {/* -- Tensión Arterial -- */}
          <AnimatedSection>
            <MetricCard
              icon={<Heart className="h-8 w-8" />}
              title="Tensión Arterial"
              description="Monitoreamos la presión arterial para detectar cambios que puedan estar relacionados con la alimentación, el estrés o la efectividad de los productos naturales que consumes."
              benefit="Permite ajustar recomendaciones de productos y hábitos para mantener una presión saludable de forma natural."
              iconWrapperClass="bg-red-50 text-red-600"
              accentClass="border-red-500 bg-red-50"
              accentIconClass="text-red-600"
            />
          </AnimatedSection>

          {/* -- Glucometría -- */}
          <AnimatedSection>
            <MetricCard
              icon={<Droplets className="h-8 w-8" />}
              title="Glucometría"
              description="Medimos los niveles de glucosa en sangre para entender cómo tu cuerpo procesa los azúcares y cómo los productos naturistas pueden apoyar un metabolismo equilibrado."
              benefit="Ayuda a personalizar la ingesta de suplementos y recomendar productos que favorezcan el control glucémico."
              iconWrapperClass="bg-emerald-50 text-emerald-600"
              accentClass="border-emerald-500 bg-emerald-50"
              accentIconClass="text-emerald-600"
            />
          </AnimatedSection>

          {/* -- Hemograma Tipo IV -- */}
          <AnimatedSection>
            <MetricCard
              icon={<FlaskConical className="h-8 w-8" />}
              title="Hemograma Tipo IV"
              description="Un análisis completo de la sangre que revela el estado de glóbulos rojos, blancos y plaquetas, proporcionando una visión integral de la salud del paciente."
              benefit="Detecta deficiencias nutricionales y permite recomendar productos específicos para fortalecer el sistema inmunológico."
              iconWrapperClass="bg-amber-50 text-amber-600"
              accentClass="border-amber-500 bg-amber-50"
              accentIconClass="text-amber-600"
            />
          </AnimatedSection>
        </div>

        {/* ---------- PATIENT – ADVISOR ---------- */}
        <AnimatedSection className="mb-16 lg:mb-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full bg-amber-300 blur-3xl" />
            </div>

            <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
              <div className="text-white">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  <Users className="h-4 w-4" />
                  Interacción Personalizada
                </div>

                <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
                  El Asesor Natural como Aliado
                </h2>

                <p className="mb-8 text-lg leading-relaxed text-emerald-50">
                  Cada medición es analizada por nuestro equipo de asesores
                  naturales, quienes interpretan los resultados y te guían en la
                  elección de los productos más adecuados para tu perfil de
                  salud. No solo vendemos productos, creamos un plan de
                  acompañamiento continuo.
                </p>

                <ul className="space-y-4">
                  {[
                    {
                      icon: <Activity className="h-5 w-5" />,
                      text: 'Evaluación personalizada de cada parámetro',
                    },
                    {
                      icon: <TrendingUp className="h-5 w-5" />,
                      text: 'Seguimiento de evolución y ajuste de recomendaciones',
                    },
                    {
                      icon: <Award className="h-5 w-5" />,
                      text: 'Productos seleccionados según tus necesidades reales',
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-emerald-50">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        {item.icon}
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative hidden items-center justify-center lg:flex">
                <div className="relative aspect-square w-full max-w-md">
                  <div className="absolute inset-0 animate-blob rounded-full bg-emerald-500/30" />
                  <div className="absolute inset-4 animate-blob rounded-full bg-emerald-400/20 animation-delay-2000" />
                  <div className="absolute inset-8 animate-blob rounded-full bg-white/10 animation-delay-4000" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Users className="mx-auto mb-4 h-20 w-20 text-white" />
                      <p className="text-sm font-medium text-white/80">
                        Paciente + Asesor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ---------- CTA ---------- */}
        <AnimatedSection className="text-center">
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-8 shadow-xl sm:p-12 lg:p-16">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              ¿Listo para transformar tu enfoque de salud?
            </h2>
            <p className="mb-8 text-lg text-gray-600">
              Únete a nuestro programa de seguimiento y descubre cómo los
              productos naturales pueden potenciar tu bienestar con el respaldo
              de datos reales.
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl">
              Comienza el seguimiento de tus pacientes
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-4 text-sm text-gray-400">
              Sin compromiso. Evalúa los beneficios durante 30 días.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
