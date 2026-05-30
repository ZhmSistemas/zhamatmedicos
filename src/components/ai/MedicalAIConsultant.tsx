'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader, AlertCircle, CheckCircle, Brain } from 'lucide-react'
import { Patient } from '@/lib/models/PatientModel'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MedicalAIConsultantProps {
  patient: Patient
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

  // Mensaje inicial de bienvenida
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
    if (!inputValue.trim()) return

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientData: patient,
          question: inputValue,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMsg = errorData.error || `Error HTTP ${response.status}`
        throw new Error(errorMsg)
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
        content: `❌ Error: ${errorMessage}\n\nVerifica:\n1. Tu API key de Deepseek está configurada en .env\n2. La API key es válida\n3. Tienes saldo en tu cuenta de Deepseek\n4. Intenta nuevamente en unos momentos`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center gap-2">
        <Brain className="w-6 h-6" />
        <div>
          <h2 className="font-bold text-lg">Asesor Médico con IA</h2>
          <p className="text-sm text-blue-100">Deepseek - Análisis Inteligente de Pacientes</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-blue-200 rounded-bl-none shadow-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
              <p
                className={`text-xs mt-2 ${
                  message.role === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-3 rounded-lg border border-blue-200 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm">Analizando datos médicos...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
        <div className="flex gap-2 text-xs text-yellow-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Este asistente proporciona análisis informativo. No reemplaza la evaluación médica profesional.
            Las recomendaciones deben ser validadas por profesionales de salud calificados.
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-blue-200 p-4 bg-white rounded-b-lg">
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pregunta sobre los datos del paciente..."
            className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setInputValue('Analiza los valores de presión arterial y glucosa actuales')}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Analizar vitales
          </button>
          <button
            onClick={() => setInputValue('¿Qué procedimientos médicos me recomiendas para este paciente?')}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Recomendaciones
          </button>
          <button
            onClick={() => setInputValue('Interpreta los resultados del hemograma')}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Hemograma
          </button>
          <button
            onClick={() => setInputValue('¿Hay algún valor crítico o anómalo que deba alertar?')}
            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Alertas
          </button>
          <button
            onClick={() => setInputValue('Analiza los productos que este paciente ha consumido, su historial de compras y dime si hay algún patrón o recomendación basada en sus condiciones de salud')}
            className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors"
          >
            Recomendar productos
          </button>
          <button
            onClick={() => setInputValue('Muéstrame el historial de productos adquiridos por el paciente, total gastado y frecuencia de compra')}
            className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
          >
            Productos adquiridos
          </button>
        </div>
      </div>
    </div>
  )
}
