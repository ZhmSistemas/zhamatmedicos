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
      weightHistory: data.weight != null ? [{ value: data.weight, recordedAt: now }] : [],
    }
    if (data.hemogram && (data.hemogram.redBloodCells != null || data.hemogram.whiteBloodCells != null || data.hemogram.platelets != null || data.hemogram.hemoglobin != null || data.hemogram.hematocrit != null)) {
      patientData.hemogramHistory = [{
        ...data.hemogram,
        recordedAt: now,
      }]
    }
    if (data.bloodPressure && (data.bloodPressure.systolic != null || data.bloodPressure.diastolic != null)) {
      patientData.bloodPressureHistory = [{
        systolic: data.bloodPressure.systolic,
        diastolic: data.bloodPressure.diastolic,
        recordedAt: now,
      }]
    }
    if (data.bloodSugar && data.bloodSugar.value != null) {
      patientData.bloodSugarHistory = [{
        value: data.bloodSugar.value,
        type: data.bloodSugar.type || '',
        recordedAt: now,
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