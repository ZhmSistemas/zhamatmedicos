import { NextRequest } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/dbConnect'
import PatientModel from '@/lib/models/PatientModel'

const addMeasurementSchema = z.object({
  type: z.enum(['bloodPressure', 'bloodSugar', 'hemogram', 'weight', 'allergies', 'diseases', 'medications']).optional(),
  bloodPressure: z.object({
    systolic: z.number().nullable(),
    diastolic: z.number().nullable(),
  }).optional(),
  bloodSugar: z.object({
    value: z.number().nullable(),
    type: z.string(),
  }).optional(),
  hemogram: z.object({
    redBloodCells: z.number().nullable(),
    whiteBloodCells: z.number().nullable(),
    platelets: z.number().nullable(),
    hemoglobin: z.number().nullable(),
    hematocrit: z.number().nullable(),
    observations: z.string().optional(),
  }).optional(),
  allergies: z.array(z.string()).optional(),
  diseases: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  name: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  weight: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
})

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ cedula: string }> }
) => {
  try {
    const { cedula } = await params

    await dbConnect()

    const patient = await PatientModel.findOne({ cedula })

    if (!patient) {
      return Response.json(
        { message: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    const patientObj = patient.toObject()
    patientObj.hemogramHistory = patientObj.hemogramHistory || []
    patientObj.bloodPressureHistory = patientObj.bloodPressureHistory || []
    patientObj.bloodSugarHistory = patientObj.bloodSugarHistory || []
    patientObj.weightHistory = patientObj.weightHistory || []

    return Response.json({ patient: patientObj }, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ cedula: string }> }
) => {
  try {
    const { cedula } = await params

    await dbConnect()

    const deleted = await PatientModel.findOneAndDelete({ cedula })

    if (!deleted) {
      return Response.json(
        { message: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    return Response.json(
      { message: 'Paciente eliminado exitosamente' },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ cedula: string }> }
) => {
  try {    
    const { cedula } = await params
    const body = await request.json()
    console.log(body)
    
    console.log('PUT request body:', JSON.stringify(body, null, 2))
    
    const data = addMeasurementSchema.parse(body)

    await dbConnect()

    const existingPatient = await PatientModel.findOne({ cedula })
    console.log('Paciente Encontrado:', existingPatient ? existingPatient.name : 'NO EXISTE')
    
    if (!existingPatient) {
      return Response.json(
        { message: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()
    let updatedPatient = null

    if (data.type === 'weight' && data.weight !== undefined) {
      console.log('Adding weight:', data.weight)
      updatedPatient = await PatientModel.findOneAndUpdate(
        { cedula },
        {
          $push: {
            weightHistory: {
              value: data.weight,
              recordedAt: now,
            }
          },
          $set: {
            weight: data.weight,
          }
        },
        { new: true }
      )
    } else if (data.name || data.lastName || data.phone || data.birthDate || data.weight !== undefined || data.height !== undefined) {
      console.log('Updating basic patient info')
      const updateFields: Record<string, unknown> = {}
      if (data.name) updateFields.name = data.name
      if (data.lastName) updateFields.lastName = data.lastName
      if (data.phone) updateFields.phone = data.phone
      if (data.birthDate) updateFields.birthDate = data.birthDate
      if (data.weight !== undefined) updateFields.weight = data.weight
      if (data.height !== undefined) updateFields.height = data.height
      
      const updateOps: Record<string, unknown> = { $set: updateFields }
      if (data.weight !== undefined) {
        updateOps.$push = {
          weightHistory: { value: data.weight, recordedAt: now }
        }
      }
      
      updatedPatient = await PatientModel.findOneAndUpdate(
        { cedula },
        updateOps,
        { new: true }
      )
    } else if (data.allergies) {
      console.log('Updating allergies:', data.allergies)
      updatedPatient = await PatientModel.findOneAndUpdate(
        { cedula },
        { $set: { allergies: data.allergies } },
        { new: true }
      )
    } else if (data.diseases) {
      console.log('Updating diseases:', data.diseases)
      updatedPatient = await PatientModel.findOneAndUpdate(
        { cedula },
        { $set: { diseases: data.diseases } },
        { new: true }
      )
    } else if (data.medications) {
      console.log('Updating medications:', data.medications)
      updatedPatient = await PatientModel.findOneAndUpdate(
        { cedula },
        { $set: { medications: data.medications } },
        { new: true }
      )
    } else if (data.type === 'bloodPressure' && data.bloodPressure) {
      console.log('Adding blood pressure:', data.bloodPressure)
      updatedPatient = await PatientModel.findOneAndUpdate(
        { cedula },
        {
          $push: {
            bloodPressureHistory: {
              systolic: data.bloodPressure.systolic,
              diastolic: data.bloodPressure.diastolic,
              recordedAt: now,
            }
          },
          $set: {
            'bloodPressure.systolic': data.bloodPressure.systolic,
            'bloodPressure.diastolic': data.bloodPressure.diastolic,
            'bloodPressure.measuredAt': now,
          }
        },
        { new: true }
      )
      console.log('Updated patient:', updatedPatient?.bloodPressure)
    } else if (data.type === 'bloodSugar' && data.bloodSugar) {
      console.log('Adding blood sugar:', data.bloodSugar)
      updatedPatient = await PatientModel.findOneAndUpdate(
        { cedula },
        {
          $push: {
            bloodSugarHistory: {
              value: data.bloodSugar.value,
              type: data.bloodSugar.type,
              recordedAt: now,
            }
          },
          $set: {
            'bloodSugar.value': data.bloodSugar.value,
            'bloodSugar.type': data.bloodSugar.type,
            'bloodSugar.measuredAt': now,
          }
        },
        { new: true }
      )
    } else if (data.type === 'hemogram' && data.hemogram) {
      console.log('Adding hemogram:', data.hemogram)
      updatedPatient = await PatientModel.findOneAndUpdate(
        { cedula },
        {
          $push: {
            hemogramHistory: {
              redBloodCells: data.hemogram.redBloodCells,
              whiteBloodCells: data.hemogram.whiteBloodCells,
              platelets: data.hemogram.platelets,
              hemoglobin: data.hemogram.hemoglobin,
              hematocrit: data.hemogram.hematocrit,
              observations: data.hemogram.observations || '',
              recordedAt: now,
            }
          },
          $set: {
            'hemogram.redBloodCells': data.hemogram.redBloodCells,
            'hemogram.whiteBloodCells': data.hemogram.whiteBloodCells,
            'hemogram.platelets': data.hemogram.platelets,
            'hemogram.hemoglobin': data.hemogram.hemoglobin,
            'hemogram.hematocrit': data.hemogram.hematocrit,
            'hemogram.observations': data.hemogram.observations || '',
          }
        },
        { new: true }
      )
    }

    console.log('Updated patient result:', updatedPatient ? 'SUCCESS' : 'NULL')

    if (updatedPatient) {
      const patientObj = updatedPatient.toObject()
      patientObj.hemogramHistory = patientObj.hemogramHistory || []
      patientObj.bloodPressureHistory = patientObj.bloodPressureHistory || []
      patientObj.bloodSugarHistory = patientObj.bloodSugarHistory || []
      patientObj.weightHistory = patientObj.weightHistory || []

      return Response.json(
        { message: 'Medición agregada exitosamente', patient: patientObj },
        { status: 200 }
      )
    }

    return Response.json({ message: 'Tipo de medición no válido' }, { status: 400 })
  } catch (err: unknown) {
    console.error('PUT error:', err)
    if (err instanceof z.ZodError) {
      return Response.json(
        { message: 'Datos inválidos' },
        { status: 422 }
      )
    }
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}