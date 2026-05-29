import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const phone = '+57 313 237 5369'
  const waUrl = `https://wa.me/3132375369?text=${encodeURIComponent('Hola, quiero información sobre sus productos naturales.')}`

  return (
    <footer className="mt-auto bg-emerald-950 text-emerald-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-xl font-bold text-white">
              Zhamat Salud
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-emerald-300">
              Acompañamiento personalizado en salud natural. Monitoreamos tu
              bienestar con parámetros clave para ofrecerte el mejor cuidado.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Enlaces
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/nosotros', label: 'Nosotros' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-emerald-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-emerald-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  Calle 17 # 8 - 37
                  <br />
                  Bogotá, Colombia
                </span>
              </li>
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-sm text-emerald-300 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-emerald-300 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  Escríbenos por WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-emerald-300">
                <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                multiservdw@hotmail.com
              </li>
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div className="flex flex-col justify-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-emerald-500 hover:shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              Contáctanos por WhatsApp
            </a>
            <p className="mt-3 text-xs text-emerald-400">
              Respondemos en menos de 1 hora
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-emerald-800 pt-6 text-center text-xs text-emerald-500">
          &copy; {new Date().getFullYear()} Zhamat Médicos. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  )
}
