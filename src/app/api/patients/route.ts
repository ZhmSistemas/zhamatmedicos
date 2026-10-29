import { NextRequest } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/dbConnect'
import PatientModel from '@/lib/models/PatientModel'

const patientSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  cedula: z.string().min(1, 'La cédula es obligatoria'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  weight: z.number().optional().nullable(),
  weightRecordedAt: z.string().optional(),
  height: z.number().optional().nullable(),
  diseases: z.array(z.string()).optional().default([]),
  allergies: z.array(z.string()).optional().default([]),
  medications: z.array(z.string()).optional().default([]),
  hemogram: z.object({
    redBloodCells: z.number().optional().nullable(),
    whiteBloodCells: z.number().optional().nullable(),
    platelets: z.number().optional().nullable(),
    hemoglobin: z.number().optional().nullable(),
    hematocrit: z.number().optional().nullable(),
    volumenCorpuscularMedio: z.number().optional().nullable(),
    bilirubina: z.number().optional().nullable(),
    bilirubinaTotal: z.number().optional().nullable(),
    bilirubinaDirecta: z.number().optional().nullable(),
    bilirubinaIndirecta: z.number().optional().nullable(),
    nitrogenoUreico: z.number().optional().nullable(),
    creatinina: z.number().optional().nullable(),
    hierroTotal: z.number().optional().nullable(),
    colesterolTotal: z.number().optional().nullable(),
    colesterolHDL: z.number().optional().nullable(),
    colesterolLDL: z.number().optional().nullable(),
    trigliceridos: z.number().optional().nullable(),
    transaminasaOxalacetica: z.number().optional().nullable(),
    transaminasaPirubica: z.number().optional().nullable(),
    deshidrogenasaLactica: z.number().optional().nullable(),
    hemoglobinaGlicosiladaAutomatizada: z.number().optional().nullable(),
    ferritina: z.number().optional().nullable(),
    recordedAt: z.string().optional(),
    observations: z.string().optional().default(''),
  }).optional(),
  bloodPressure: z.object({
    systolic: z.number().optional().nullable(),
    diastolic: z.number().optional().nullable(),
    measuredAt: z.string().optional().default(''),
  }).optional(),
  bloodSugar: z.object({
    value: z.number().optional().nullable(),
    type: z.string().optional().default(''),
    measuredAt: z.string().optional().default(''),
  }).optional(),
  observations: z.string().optional().default(''),
  observationsRecordedAt: z.string().optional(),
  observationsHistory: z.array(z.object({
    text: z.string(),
    recordedAt: z.string(),
    expirationDate: z.string().optional().default(''),
  })).optional(),
})

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const data = patientSchema.parse(body)

    await dbConnect()

    const existingPatient = await PatientModel.findOne({ cedula: data.cedula })
    if (existingPatient) {
      return Response.json(
        { message: 'Ya existe un paciente con esa cédula' },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const patientData: Record<string, unknown> = {
      ...data,
      weightHistory: data.weight != null ? [{ value: data.weight, recordedAt: data.weightRecordedAt || now }] : [],
    }
    if (data.hemogram && (
      data.hemogram.redBloodCells != null ||
      data.hemogram.whiteBloodCells != null ||
      data.hemogram.platelets != null ||
      data.hemogram.hemoglobin != null ||
      data.hemogram.hematocrit != null ||
      data.hemogram.volumenCorpuscularMedio != null ||
      data.hemogram.bilirubina != null ||
      data.hemogram.bilirubinaTotal != null ||
      data.hemogram.bilirubinaDirecta != null ||
      data.hemogram.bilirubinaIndirecta != null ||
      data.hemogram.nitrogenoUreico != null ||
      data.hemogram.creatinina != null ||
      data.hemogram.hierroTotal != null ||
      data.hemogram.colesterolTotal != null ||
      data.hemogram.colesterolHDL != null ||
      data.hemogram.colesterolLDL != null ||
      data.hemogram.trigliceridos != null ||
      data.hemogram.transaminasaOxalacetica != null ||
      data.hemogram.transaminasaPirubica != null ||
      data.hemogram.deshidrogenasaLactica != null ||
      data.hemogram.hemoglobinaGlicosiladaAutomatizada != null ||
      data.hemogram.ferritina != null
    )) {
      patientData.hemogramHistory = [{
        ...data.hemogram,
        recordedAt: data.hemogram?.recordedAt || now,
      }]
    }
    if (data.bloodPressure && (data.bloodPressure.systolic != null || data.bloodPressure.diastolic != null)) {
      patientData.bloodPressureHistory = [{
        systolic: data.bloodPressure.systolic,
        diastolic: data.bloodPressure.diastolic,
        recordedAt: data.bloodPressure.measuredAt || now,
      }]
    }
    if (data.bloodSugar && data.bloodSugar.value != null) {
      patientData.bloodSugarHistory = [{
        value: data.bloodSugar.value,
        type: data.bloodSugar.type || '',
        recordedAt: data.bloodSugar.measuredAt || now,
      }]
    }
    if (data.observationsHistory && data.observationsHistory.length > 0) {
      patientData.observationsHistory = data.observationsHistory
    } else if (data.observations && data.observations.trim()) {
      patientData.observationsHistory = [{
        text: data.observations,
        recordedAt: data.observationsRecordedAt || now,
        expirationDate: '',
      }]
    }
    const newPatient = new PatientModel(patientData)
    await newPatient.save()

    return Response.json(
      { message: 'Paciente creado exitosamente', patient: newPatient },
      { status: 201 }
    )
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { message: 'Datos inválidos'},
        { status: 422 }
      )
    }
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

export const GET = async () => {
  try {
    await dbConnect()
    const patients = await PatientModel.find({}).sort({ createdAt: -1 })
    const patientsWithDefaults = patients.map(p => {
      const obj = p.toObject()
      obj.hemogramHistory = obj.hemogramHistory || []
      obj.bloodPressureHistory = obj.bloodPressureHistory || []
      obj.bloodSugarHistory = obj.bloodSugarHistory || []
      obj.weightHistory = obj.weightHistory || []
      obj.consumedProducts = obj.consumedProducts || []
      obj.consumedProductsHistory = obj.consumedProductsHistory || []
      return obj
    })
    return Response.json({ patients: patientsWithDefaults }, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}