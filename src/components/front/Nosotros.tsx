'use client'

import { useEffect, useRef, useState } from 'react'
import { Shield, Target, Heart, Eye, Leaf, Users, Star, Quote } from 'lucide-react'

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

interface ValueCardProps {
  icon: React.ReactNode
  title: string
  description: string
  iconWrapperClass: string
}

function ValueCard({ icon, title, description, iconWrapperClass }: ValueCardProps) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:p-8">
      <div
        className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 ${iconWrapperClass}`}
      >
        {icon}
      </div>
      <h3 className="mb-3 text-lg font-bold text-gray-800">{title}</h3>
      <p className="leading-relaxed text-gray-600">{description}</p>
    </div>
  )
}

export default function Nosotros() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-emerald-50 via-white to-stone-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-amber-100/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        {/* Hero */}
        <AnimatedSection className="mb-16 lg:mb-24">
          <div className="grid items-center gap-12 lg:grid-cols-5">
            <div className="flex items-center justify-center lg:col-span-2">
              <video
                src="https://res.cloudinary.com/dc7hpxqys/video/upload/q_auto/f_auto/v1779567400/zhamatmedicos_logo_e7yhso.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full max-w-sm"
              />
            </div>

            <div className="text-center lg:col-span-3 lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                <Shield className="h-4 w-4" />
                Quiénes Somos
              </div>

              <h1 className="mb-6 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Transformando la Salud a través de{' '}
                <span className="bg-linear-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  Productos Naturales
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl lg:mx-0">
                En <strong>Zhamat Salud</strong> creemos en el poder de la naturaleza para
                mejorar la calidad de vida. Somos una empresa comprometida con el bienestar
                integral de nuestros pacientes, combinando productos naturales de alta calidad
                con un acompañamiento personalizado basado en datos reales.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Misión y Visión */}
        <div className="mb-16 grid gap-8 lg:mb-24 lg:grid-cols-2">
          <AnimatedSection>
            <div className="group relative h-full rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:p-12">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-500 group-hover:scale-110">
                <Target className="h-8 w-8" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Nuestra Misión</h2>
              <p className="leading-relaxed text-gray-600">
                Proveer productos naturales de la más alta calidad y un servicio de
                acompañamiento personalizado que permita a cada persona alcanzar sus objetivos
                de salud y bienestar, respaldando cada recomendación con monitoreo real de
                parámetros clave como tensión arterial, glucometría y hemograma.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="group relative h-full rounded-2xl border border-amber-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:p-12">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform duration-500 group-hover:scale-110">
                <Eye className="h-8 w-8" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Nuestra Visión</h2>
              <p className="leading-relaxed text-gray-600">
                Ser la empresa líder en Latinoamérica en el cuidado de la salud a través de
                productos naturales, reconocida por nuestro enfoque innovador que integra la
                sabiduría de la naturaleza con el seguimiento clínico personalizado,
                transformando la manera en que las personas cuidan su salud.
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* Valores */}
        <AnimatedSection className="mb-16 lg:mb-24">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
              <Star className="h-4 w-4" />
              Nuestros Valores
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Principios que nos guían
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ValueCard
              icon={<Heart className="h-7 w-7" />}
              title="Compromiso con la Salud"
              description="Cada producto y recomendación está respaldado por un profundo compromiso con el bienestar real de nuestros pacientes."
              iconWrapperClass="bg-red-50 text-red-600"
            />
            <ValueCard
              icon={<Leaf className="h-7 w-7" />}
              title="Calidad Natural"
              description="Seleccionamos cuidadosamente cada producto natural garantizando su pureza, origen y efectividad."
              iconWrapperClass="bg-emerald-50 text-emerald-600"
            />
            <ValueCard
              icon={<Users className="h-7 w-7" />}
              title="Acompañamiento Personalizado"
              description="Cada paciente es único. Diseñamos planes de seguimiento adaptados a sus necesidades específicas."
              iconWrapperClass="bg-blue-50 text-blue-600"
            />
            <ValueCard
              icon={<Shield className="h-7 w-7" />}
              title="Transparencia"
              description="Basamos nuestras recomendaciones en datos objetivos de monitoreo, no en promesas vacías."
              iconWrapperClass="bg-amber-50 text-amber-600"
            />
            <ValueCard
              icon={<Target className="h-7 w-7" />}
              title="Innovación"
              description="Integramos tecnología y naturaleza para ofrecer un servicio de salud moderno y efectivo."
              iconWrapperClass="bg-purple-50 text-purple-600"
            />
            <ValueCard
              icon={<Quote className="h-7 w-7" />}
              title="Empatía"
              description="Escuchamos, entendemos y acompañamos a cada persona en su camino hacia una vida más saludable."
              iconWrapperClass="bg-pink-50 text-pink-600"
            />
          </div>
        </AnimatedSection>

        {/* Historia / CTA */}
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full bg-amber-300 blur-3xl" />
            </div>

            <div className="relative p-8 text-center sm:p-12 lg:p-16">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Heart className="h-4 w-4" />
                Nuestra Historia
              </div>

              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
                Más que una tienda, un acompañamiento
              </h2>

              <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-emerald-50">
                Zhamat Salud nació de la convicción de que la salud no debería ser un
                privilegio, sino un derecho accesible para todos. Comenzamos como un pequeño
                proyecto familiar con la visión de ofrecer alternativas naturales respaldadas
                por ciencia y seguimiento real. Hoy, somos un equipo multidisciplinario de
                asesores naturales, nutriólogos y profesionales de la salud comprometidos con
                transformar vidas.
              </p>

              <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-3">
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                  <p className="text-3xl font-bold text-white">+500</p>
                  <p className="text-sm text-emerald-200">Pacientes atendidos</p>
                </div>
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                  <p className="text-3xl font-bold text-white">+50</p>
                  <p className="text-sm text-emerald-200">Productos naturales</p>
                </div>
                <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                  <p className="text-3xl font-bold text-white">98%</p>
                  <p className="text-sm text-emerald-200">Satisfacción</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
