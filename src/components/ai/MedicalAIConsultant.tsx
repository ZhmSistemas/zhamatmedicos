'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader, AlertCircle, Brain, User, Activity, Stethoscope, HeartPulse, FlaskConical, Sparkles } from 'lucide-react'
import { Patient } from '@/lib/models/PatientModel'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MedicalAIConsultantProps {
  patient: Patient
}

const quickActions = [
  {
    label: 'Analizar vitales',
    prompt: 'Analiza los valores de presión arterial y glucosa actuales',
    icon: Activity,
    color: 'bg-sky-100 text-sky-700 hover:bg-sky-200 active:bg-sky-300',
  },
  {
    label: 'Recomendaciones',
    prompt: '¿Qué procedimientos médicos me recomiendas para este paciente?',
    icon: Stethoscope,
    color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:bg-indigo-300',
  },
  {
    label: 'Hemograma',
    prompt: 'Interpreta los resultados del hemograma',
    icon: FlaskConical,
    color: 'bg-violet-100 text-violet-700 hover:bg-violet-200 active:bg-violet-300',
  },
  {
    label: 'Alertas',
    prompt: '¿Hay algún valor crítico o anómalo que deba alertar?',
    icon: AlertCircle,
    color: 'bg-rose-100 text-rose-700 hover:bg-rose-200 active:bg-rose-300',
  },
  {
    label: 'Recomendar productos',
    prompt: 'Analiza los productos que este paciente ha consumido, su historial de compras y dime si hay algún patrón o recomendación basada en sus condiciones de salud',
    icon: HeartPulse,
    color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:bg-emerald-300',
  },
  {
    label: 'Productos adquiridos',
    prompt: 'Muéstrame el historial de productos adquiridos por el paciente, total gastado y frecuencia de compra',
    icon: Sparkles,
    color: 'bg-teal-100 text-teal-700 hover:bg-teal-200 active:bg-teal-300',
  },
]

function TypingIndicator() {
  return (
    <div className="flex justify-start" role="status" aria-label="La IA está generando una respuesta">
      <div className="flex items-end gap-2">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-blue-600 shadow-sm">
          <Brain className="h-4 w-4 text-white" />
        </div>
        <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MedicalAIConsultant({ patient }: MedicalAIConsultantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Hola, soy tu asistente médico IA. He analizado los datos del paciente ${patient.name} ${patient.lastName}.

¿Qué deseas consultar sobre este paciente? Puedo ayudarte con:
- Análisis de valores clínicos actuales
- Recomendaciones de procedimientos médicos
- Interpretación de resultados de laboratorio
- Identificación de patrones o anomalías en el historial
- Sugerencias para seguimiento médico
- Recomendación de productos naturales según sus condiciones`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [patient])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/medical-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData: patient,
          question: inputValue,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error en la respuesta de la IA')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error en consulta de IA:', errorMessage)
      setError(errorMessage)

      const errorMsg: Message = {
        role: 'assistant',
        content: `Error: ${errorMessage}

Verifica:
1. Tu API key de Deepseek está configurada en .env
2. La API key es válida
3. Tienes saldo en tu cuenta de Deepseek
4. Intenta nuevamente en unos momentos`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 bg-linear-to-r from-indigo-600 to-blue-600 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-white">Asesor Médico con IA</h2>
          <p className="text-xs text-indigo-100">Deepseek &middot; An&aacute;lisis Inteligente</p>
        </div>
        <div className="flex h-7 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[11px] text-white backdrop-blur-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          En l&iacute;nea
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 px-4 py-5">
        <div className="space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in-up [animation-duration:300ms]`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-blue-600 shadow-sm">
                  <Brain className="h-4 w-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-sm px-4 py-3 sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                  message.role === 'user'
                    ? 'rounded-2xl rounded-br-sm bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200'
                    : 'rounded-2xl rounded-bl-sm bg-white text-gray-800 shadow-sm ring-1 ring-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
                <p
                  className={`mt-1.5 text-right text-[11px] font-medium ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 shadow-sm">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Disclaimer */}
      {/* <div className="border-t border-gray-100 bg-amber-50/80 px-5 py-2.5">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <p className="text-[11px] leading-relaxed text-amber-800">
            Este asistente proporciona an&aacute;lisis informativo. No reemplaza la evaluaci&oacute;n m&eacute;dica profesional.
            Las recomendaciones deben ser validadas por profesionales de salud calificados.
          </p>
        </div>
      </div> */}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-3">
        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError('')}
              className="flex h-7 w-7 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
              aria-label="Cerrar mensaje de error"
            >
              &times;
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta sobre los datos del paciente..."
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Mensaje para el asistente IA"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-sm transition-all hover:shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 active:translate-y-0"
            aria-label={loading ? 'Enviando mensaje...' : 'Enviar mensaje'}
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Acciones r&aacute;pidas">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setInputValue(action.prompt)}
              disabled={loading}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all ${action.color} disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label={`Preguntar: ${action.label}`}
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
