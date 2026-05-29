'use client'

import { useState } from 'react'
import { useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, User, Activity, Heart, Droplets } from 'lucide-react'

interface PatientFormProps {
  onSuccess?: () => void
}

type PatientFormInputs = {
  name: string
  lastName: string
  cedula: string
  email: string
  phone: string
  birthDate?: string
  gender?: string
  address?: string
  weight?: string
  height?: string
  diseases?: string[]
  allergies?: string[]
  medications?: string[]
  hemogram?: {
    redBloodCells?: string
    whiteBloodCells?: string
    platelets?: string
    hemoglobin?: string
    hematocrit?: string
    observations?: string
  }
  bloodPressure?: {
    systolic?: string
    diastolic?: string
    measuredAt?: string
  }
  bloodSugar?: {
    value?: string
    type?: string
    measuredAt?: string
  }
  observations?: string
}

const patientSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  cedula: z.string().min(1, 'La cédula es obligatoria'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  diseases: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  hemogram: z.object({
    redBloodCells: z.string().optional(),
    whiteBloodCells: z.string().optional(),
    platelets: z.string().optional(),
    hemoglobin: z.string().optional(),
    hematocrit: z.string().optional(),
    observations: z.string().optional(),
  }).optional(),
  bloodPressure: z.object({
    systolic: z.string().optional(),
    diastolic: z.string().optional(),
    measuredAt: z.string().optional(),
  }).optional(),
  bloodSugar: z.object({
    value: z.string().optional(),
    type: z.string().optional(),
    measuredAt: z.string().optional(),
  }).optional(),
  observations: z.string().optional(),
})

export default function PatientForm({ onSuccess }: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const [diseaseInput, setDiseaseInput] = useState('')
  const [allergyInput, setAllergyInput] = useState('')
  const [medicationInput, setMedicationInput] = useState('')
  const [diseases, setDiseases] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [medications, setMedications] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormInputs>({
    resolver: zodResolver(patientSchema) as Resolver<PatientFormInputs>,
    defaultValues: {
      name: '',
      lastName: '',
      cedula: '',
      email: '',
      phone: '',
      birthDate: '',
      gender: '',
      address: '',
      weight: '',
      height: '',
      diseases: [],
      allergies: [],
      medications: [],
      hemogram: {
        redBloodCells: '',
        whiteBloodCells: '',
        platelets: '',
        hemoglobin: '',
        hematocrit: '',
        observations: '',
      },
      bloodPressure: {
        systolic: '',
        diastolic: '',
        measuredAt: '',
      },
      bloodSugar: {
        value: '',
        type: '',
        measuredAt: '',
      },
      observations: '',
    },
  })

  const addItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    input: string,
    clearInput: () => void
  ) => {
    if (input.trim()) {
      setter((prev) => [...prev, input.trim()])
      clearInput()
    }
  }

  const removeItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PatientFormInputs) => {
    setIsLoading(true)
    setServerError(null)
    setServerSuccess(null)

    try {
      const payload = {
        ...data,
        diseases,
        allergies,
        medications,
        weight: data.weight ? parseFloat(data.weight) : null,
        height: data.height ? parseFloat(data.height) : null,
        hemogram: data.hemogram ? {
          redBloodCells: data.hemogram.redBloodCells ? parseFloat(data.hemogram.redBloodCells) : null,
          whiteBloodCells: data.hemogram.whiteBloodCells ? parseFloat(data.hemogram.whiteBloodCells) : null,
          platelets: data.hemogram.platelets ? parseFloat(data.hemogram.platelets) : null,
          hemoglobin: data.hemogram.hemoglobin ? parseFloat(data.hemogram.hemoglobin) : null,
          hematocrit: data.hemogram.hematocrit ? parseFloat(data.hemogram.hematocrit) : null,
          observations: data.hemogram.observations || '',
        } : {},
        bloodPressure: data.bloodPressure ? {
          systolic: data.bloodPressure.systolic ? parseFloat(data.bloodPressure.systolic) : null,
          diastolic: data.bloodPressure.diastolic ? parseFloat(data.bloodPressure.diastolic) : null,
          measuredAt: data.bloodPressure.measuredAt || '',
        } : {},
        bloodSugar: data.bloodSugar ? {
          value: data.bloodSugar.value ? parseFloat(data.bloodSugar.value) : null,
          type: data.bloodSugar.type || '',
          measuredAt: data.bloodSugar.measuredAt || '',
        } : {},
      }

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear el paciente')
      }

      setServerSuccess('Paciente creado exitosamente')
      reset()
      setDiseases([])
      setAllergies([])
      setMedications([])
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message)
      } else {
        setServerError('Ocurrió un error inesperado')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Paciente</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete todos los campos obligatorios para registrar un nuevo paciente
          </p>
        </div>

        {serverError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {serverSuccess && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-700">
            {serverSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl bg-white p-6 shadow-lg">
          <section className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <User className="h-5 w-5 text-indigo-600" />
              Datos Personales
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('lastName')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('cedula')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {errors.cedula && <p className="mt-1 text-sm text-red-600">{errors.cedula.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('phone')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                  type="date"
                  {...register('birthDate')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Género</label>
                <select
                  {...register('gender')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  {...register('address')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('weight')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('height')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Activity className="h-5 w-5 text-indigo-600" />
              Historial Médico
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Enfermedades Padecidas</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={diseaseInput}
                  onChange={(e) => setDiseaseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem(setDiseases, diseaseInput, () => setDiseaseInput(''))
                    }
                  }}
                  placeholder="Ej: Diabetes, Hipertensión"
                  className="flex-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => addItem(setDiseases, diseaseInput, () => setDiseaseInput(''))}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {diseases.map((disease, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                  >
                    {disease}
                    <button type="button" onClick={() => removeItem(setDiseases, index)}>
                      <Trash2 className="h-4 w-4 cursor-pointer hover:text-red-900" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Alergias</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem(setAllergies, allergyInput, () => setAllergyInput(''))
                    }
                  }}
                  placeholder="Ej: Penicilina, Mariscos"
                  className="flex-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => addItem(setAllergies, allergyInput, () => setAllergyInput(''))}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700"
                  >
                    {allergy}
                    <button type="button" onClick={() => removeItem(setAllergies, index)}>
                      <Trash2 className="h-4 w-4 cursor-pointer hover:text-orange-900" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Medicamentos Actuales</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem(setMedications, medicationInput, () => setMedicationInput(''))
                    }
                  }}
                  placeholder="Ej: Metformina, Losartán"
                  className="flex-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => addItem(setMedications, medicationInput, () => setMedicationInput(''))}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {medications.map((medication, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {medication}
                    <button type="button" onClick={() => removeItem(setMedications, index)}>
                      <Trash2 className="h-4 w-4 cursor-pointer hover:text-blue-900" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Droplets className="h-5 w-5 text-indigo-600" />
              Hemograma
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Glóbulos Rojos (millones/μL)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('hemogram.redBloodCells')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Glóbulos Blancos (miles/μL)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('hemogram.whiteBloodCells')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plaquetas (miles/μL)</label>
                <input
                  type="number"
                  step="1"
                  {...register('hemogram.platelets')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hemoglobina (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('hemogram.hemoglobin')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hematocrito (%)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('hemogram.hematocrit')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea
                  {...register('hemogram.observations')}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </section>

          <section className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Heart className="h-5 w-5 text-indigo-600" />
              Tensión Arterial
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Presión Sistólica (mmHg)</label>
                <input
                  type="number"
                  {...register('bloodPressure.systolic')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Presión Diastólica (mmHg)</label>
                <input
                  type="number"
                  {...register('bloodPressure.diastolic')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Medición</label>
                <input
                  type="datetime-local"
                  {...register('bloodPressure.measuredAt')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </section>

          <section className="pb-6">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Droplets className="h-5 w-5 text-indigo-600" />
              Azúcar en Sangre
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nivel de Glucosa (mg/dL)</label>
                <input
                  type="number"
                  {...register('bloodSugar.value')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Medición</label>
                <select
                  {...register('bloodSugar.type')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar</option>
                  <option value="ayunas">En Ayunas</option>
                  <option value="postprandial">Postprandial</option>
                  <option value="aleatorio">Aleatorio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Medición</label>
                <input
                  type="datetime-local"
                  {...register('bloodSugar.measuredAt')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </section>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Observaciones Generales</label>
            <textarea
              {...register('observations')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                reset()
                setDiseases([])
                setAllergies([])
                setMedications([])
              }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar Paciente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}