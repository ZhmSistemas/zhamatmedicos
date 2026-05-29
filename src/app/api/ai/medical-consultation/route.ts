import { NextRequest, NextResponse } from 'next/server'
import dbConnectLocal from '@/lib/dbConnectLocal'
import { getProductModel } from '@/lib/models/ProductLocalModel'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

export async function POST(request: NextRequest) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { patientData, question } = body

    const patient = {
      ...patientData,
      diseases: patientData?.diseases ?? [],
      allergies: patientData?.allergies ?? [],
      medications: patientData?.medications ?? [],
      hemogram: {
        redBloodCells: patientData?.hemogram?.redBloodCells ?? null,
        whiteBloodCells: patientData?.hemogram?.whiteBloodCells ?? null,
        platelets: patientData?.hemogram?.platelets ?? null,
        hemoglobin: patientData?.hemogram?.hemoglobin ?? null,
        hematocrit: patientData?.hemogram?.hematocrit ?? null,
        observations: patientData?.hemogram?.observations ?? '',
      },
      bloodPressure: {
        systolic: patientData?.bloodPressure?.systolic ?? null,
        diastolic: patientData?.bloodPressure?.diastolic ?? null,
      },
      bloodSugar: {
        value: patientData?.bloodSugar?.value ?? null,
        type: patientData?.bloodSugar?.type ?? '',
      },
    }

    // Construir el contexto médico con los datos del paciente
    const medicalContext = `
Datos del Paciente:
- Nombre: ${patient.name} ${patient.lastName}
- Edad: ${calculateAge(patient.birthDate)} años
- Género: ${patient.gender}
- Peso: ${patient.weight} kg
- Altura: ${patient.height} cm
- Enfermedades previas: ${patient.diseases.join(', ') || 'Ninguna'}
- Alergias: ${patient.allergies.join(', ') || 'Ninguna'}
- Medicamentos actuales: ${patient.medications.join(', ') || 'Ninguno'}
- Presión arterial: ${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic} mmHg
- Glucosa en sangre: ${patient.bloodSugar.value} mg/dL (${patient.bloodSugar.type})
- Hemograma:
  * Glóbulos rojos: ${patient.hemogram.redBloodCells}
  * Glóbulos blancos: ${patient.hemogram.whiteBloodCells}
  * Plaquetas: ${patient.hemogram.platelets}
  * Hemoglobina: ${patient.hemogram.hemoglobin} g/dL
  * Hematocrito: ${patient.hemogram.hematocrit} %
  * Observaciones: ${patient.hemogram.observations}
- Observaciones generales: ${patient.observations}
    `

    // Obtener productos disponibles desde la base de datos local
    let catalog = ''
    try {
      const conn = await dbConnectLocal()
      const ProductModel = getProductModel(conn)
      const products = await ProductModel.find({}).lean()
      if (products.length > 0) {
        catalog = products.map((p: Record<string, unknown>) =>
          `- ${p.name}${p.brand ? ` (${p.brand})` : ''}${p.priceventa != null ? ` - $${p.priceventa}` : ''}${p.description ? `: ${p.description}` : ''}${p.dirigido ? ` | Dirigido a: ${p.dirigido}` : ''}${p.uso ? ` | Modo de uso: ${p.uso}` : ''}`
        ).join('\n')
      }
    } catch {
      catalog = '(Base de datos de productos no disponible)'
    }

    const systemPrompt = `Eres un asistente médico inteligente especializado en análisis de datos clínicos y recomendaciones médicas.
Tu rol es:
1. Analizar los datos del paciente proporcionados
2. Identificar patrones y anomalías en los resultados clínicos
3. Sugerir procedimientos médicos o estudios adicionales que sean apropiados
4. Proporcionar información educativa sobre condiciones de salud
5. Alertar sobre valores críticos que requieran atención inmediata
6. Recomendar productos naturales o suplementos del catálogo disponible según las condiciones del paciente

Catálogo de productos disponibles:
${catalog || '(No hay productos disponibles)'}

Al recomendar productos:
- Basa tus sugerencias en los síntomas, enfermedades y valores clínicos del paciente
- Explica POR QUÉ cada producto es adecuado para el paciente
- Menciona el modo de uso y a quién está dirigido
- Siempre indica que los productos naturales complementan pero no reemplazan tratamientos médicos recetados
- Si ningún producto aplica, indícalo claramente

IMPORTANTE:
- Siempre incluye un descargo de responsabilidad indicando que esto no reemplaza la consulta médica profesional
- Basa tus recomendaciones en datos clínicos reales
- Sé claro y específico en tus sugerencias
- Usa terminología médica precisa pero también explica en lenguaje simple
- Si detectas valores críticos, destácalos en rojo o con énfasis`

    const userMessage = `${medicalContext}\n\nPregunta del médico: ${question}`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`
      try {
        const errorData = await response.json()
        console.error('Error de Deepseek:', errorData)
        errorMessage = errorData.error?.message || JSON.stringify(errorData)
      } catch {
        const text = await response.text()
        console.error('Error de Deepseek (texto):', text)
        errorMessage = text || errorMessage
      }
      
      return NextResponse.json(
        { 
          error: `Error al consultar la IA: ${errorMessage}`,
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Formato inesperado de respuesta Deepseek:', data)
      return NextResponse.json(
        { error: 'Formato inesperado de respuesta de la IA' },
        { status: 500 }
      )
    }

    const aiResponse = data.choices[0].message.content

    return NextResponse.json({
      success: true,
      response: aiResponse,
      patientData: {
        name: `${patientData.name} ${patientData.lastName}`,
        cedula: patientData.cedula,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error en consulta médica:', errorMessage)
    return NextResponse.json(
      { 
        error: `Error interno: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
