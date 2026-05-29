'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { Search, User, Activity, Heart, Droplets, AlertCircle, Pill, Scale, Calendar, Phone, Plus, X, ChevronDown, ChevronUp, TrendingUp, Trash2 } from 'lucide-react'

const searchSchema = z.object({
  cedula: z.string().min(1, 'Ingrese la cédula del paciente'),
})

type SearchInputs = z.infer<typeof searchSchema>

const measurementSchema = z.object({
  type: z.enum(['bloodPressure', 'bloodSugar', 'hemogram', 'weight']),
  weight: z.string().optional(),
  bloodPressure: z.object({
    systolic: z.string().optional(),
    diastolic: z.string().optional(),
  }).optional(),
  bloodSugar: z.object({
    value: z.string().optional(),
    type: z.string().optional(),
  }).optional(),
  hemogram: z.object({
    redBloodCells: z.string().optional(),
    whiteBloodCells: z.string().optional(),
    platelets: z.string().optional(),
    hemoglobin: z.string().optional(),
    hematocrit: z.string().optional(),
    observations: z.string().optional(),
  }).optional(),
})

type MeasurementInputs = z.infer<typeof measurementSchema>

interface BloodPressureRecord {
  _id: string
  systolic: number | null
  diastolic: number | null
  recordedAt: string
}

interface BloodSugarRecord {
  _id: string
  value: number | null
  type: string
  recordedAt: string
}

interface WeightRecord {
  _id: string
  value: number | null
  recordedAt: string
}

interface HemogramRecord {
  _id: string
  redBloodCells: number | null
  whiteBloodCells: number | null
  platelets: number | null
  hemoglobin: number | null
  hematocrit: number | null
  observations: string
  recordedAt: string
}

interface Patient {
  _id: string
  name: string
  lastName: string
  cedula: string
  email: string
  phone: string
  birthDate: string
  gender: string
  address: string
  weight: number | null
  height: number | null
  diseases: string[]
  allergies: string[]
  medications: string[]
  hemogram: {
    redBloodCells: number | null
    whiteBloodCells: number | null
    platelets: number | null
    hemoglobin: number | null
    hematocrit: number | null
    observations: string
  }
  bloodPressure: {
    systolic: number | null
    diastolic: number | null
    measuredAt: string
  }
  bloodSugar: {
    value: number | null
    type: string
    measuredAt: string
  }
  observations: string
  hemogramHistory: HemogramRecord[]
  bloodPressureHistory: BloodPressureRecord[]
  bloodSugarHistory: BloodSugarRecord[]
  weightHistory: WeightRecord[]
  consumedProducts: Array<{ productId: string; productName: string; quantity: number; recordedAt: string }>
  consumedProductsHistory: Array<{ _id: string; productId: string; productName: string; quantity: number; recordedAt: string }>
  createdAt: string
  updatedAt: string
}

interface PatientHistoryProps {
  initialCedula?: string
  onBack?: () => void
}

export default function PatientHistory({ initialCedula, onBack }: PatientHistoryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [measurementType, setMeasurementType] = useState<'bloodPressure' | 'bloodSugar' | 'hemogram' | 'weight'>('bloodPressure')
  const [isAdding, setIsAdding] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [expandedBpHistory, setExpandedBpHistory] = useState(false)
  const [expandedBsHistory, setExpandedBsHistory] = useState(false)
  const [expandedHgHistory, setExpandedHgHistory] = useState(false)
  const [expandedWeightHistory, setExpandedWeightHistory] = useState(false)
  const [showEditInfoModal, setShowEditInfoModal] = useState(false)
  const [editInfoType, setEditInfoType] = useState<'allergies' | 'diseases' | 'medications'>('allergies')
  const [editInfoInput, setEditInfoInput] = useState('')
  const [products, setProducts] = useState<{ _id: string; name: string; brand: string }[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [productQuantity, setProductQuantity] = useState(1)
  const [pendingProducts, setPendingProducts] = useState<{ productId: string; productName: string; quantity: number }[]>([])
  const [expandedProductsHistory, setExpandedProductsHistory] = useState(false)
  const [showEditPatientModal, setShowEditPatientModal] = useState(false)
  const [editPatientData, setEditPatientData] = useState({
    name: '',
    lastName: '',
    phone: '',
    birthDate: '',
    weight: '',
    height: '',
    cedula: '',
  })

  const sortByDateDesc = <T extends { recordedAt?: string }>(arr: T[]): T[] => {
    return [...arr].sort((a, b) => {
      const dateA = a.recordedAt ? new Date(a.recordedAt).getTime() : 0
      const dateB = b.recordedAt ? new Date(b.recordedAt).getTime() : 0
      return dateB - dateA
    })
  }

  const sortByDateAsc = <T extends { recordedAt?: string }>(arr: T[]): T[] => {
    return [...arr].sort((a, b) => {
      const dateA = a.recordedAt ? new Date(a.recordedAt).getTime() : 0
      const dateB = b.recordedAt ? new Date(b.recordedAt).getTime() : 0
      return dateA - dateB
    })
  }

  const formatChartDate = (dateStr: unknown) => {
    if (!dateStr || typeof dateStr !== 'string') return ''
    const d = new Date(dateStr)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  const tooltipLabel = (label: unknown) => {
    if (!label || typeof label !== 'string') return ''
    return formatDateTime(label)
  }

  const {
    register: registerSearch,
    handleSubmit: handleSearchSubmit,
    formState: { errors: searchErrors },
  } = useForm<SearchInputs>({
    resolver: zodResolver(searchSchema),
    defaultValues: { cedula: '' },
  })

  const {
    register: registerMeasurement,
    handleSubmit: handleMeasurementSubmit,
    watch,
    formState: { errors: measurementErrors },
    reset: resetMeasurement,
  } = useForm<MeasurementInputs>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      type: 'bloodPressure',
      weight: '',
      bloodPressure: { systolic: '', diastolic: '' },
      bloodSugar: { value: '', type: '' },
      hemogram: {
        redBloodCells: '',
        whiteBloodCells: '',
        platelets: '',
        hemoglobin: '',
        hematocrit: '',
        observations: '',
      },
    },
  })

  const submitMeasurement = () => {
    console.log('submitMeasurement called')
    const formData = watch()
    console.log('Form data from watch:', formData)
    addMeasurement({ ...formData, type: measurementType } as MeasurementInputs)
  }

  const searchPatient = useCallback(async (data: SearchInputs) => {
    setIsLoading(true)
    setError(null)
    setPatient(null)

    try {
      const response = await fetch(`/api/patients/${data.cedula}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al buscar paciente')
      }

      setPatient(result.patient)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialCedula) {
      searchPatient({ cedula: initialCedula })
    }
  }, [initialCedula, searchPatient])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/productos')
      const data = await res.json()
      if (res.ok) {
        setProducts(data.products)
      }
    } catch {
      console.error('Error al cargar productos')
    }
  }

  const addMeasurement = async (data: MeasurementInputs) => {
    if (!patient) return

    setIsAdding(true)
    setAddSuccess(false)
    setError(null)

    try {
      const payload: Record<string, unknown> = { type: measurementType }

      if (measurementType === 'weight') {
        payload.weight = data.weight ? parseFloat(data.weight) : null
      } else if (measurementType === 'bloodPressure' && data.bloodPressure) {
        payload.bloodPressure = {
          systolic: parseFloat(data.bloodPressure.systolic || '0'),
          diastolic: parseFloat(data.bloodPressure.diastolic || '0'),
        }
      } else if (measurementType === 'bloodSugar' && data.bloodSugar) {
        payload.bloodSugar = {
          value: parseFloat(data.bloodSugar.value || '0'),
          type: data.bloodSugar.type || 'ayunas',
        }
      } else if (measurementType === 'hemogram' && data.hemogram) {
        payload.hemogram = {
          redBloodCells: data.hemogram.redBloodCells ? parseFloat(data.hemogram.redBloodCells) : null,
          whiteBloodCells: data.hemogram.whiteBloodCells ? parseFloat(data.hemogram.whiteBloodCells) : null,
          platelets: data.hemogram.platelets ? parseFloat(data.hemogram.platelets) : null,
          hemoglobin: data.hemogram.hemoglobin ? parseFloat(data.hemogram.hemoglobin) : null,
          hematocrit: data.hemogram.hematocrit ? parseFloat(data.hemogram.hematocrit) : null,
          observations: data.hemogram.observations || '',
        }
      }

      const response = await fetch(`/api/patients/${patient.cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al agregar medición')
      }

      setPatient(result.patient)
      setAddSuccess(true)
      resetMeasurement()
      setShowAddModal(false)

      setTimeout(() => setAddSuccess(false), 3000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado')
      }
    } finally {
      setIsAdding(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getBloodPressureStatus = (systolic: number | null, diastolic: number | null) => {
    if (!systolic || !diastolic) return null
    if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-green-600 bg-green-50' }
    if (systolic < 130 && diastolic < 80) return { label: 'Elevada', color: 'text-yellow-600 bg-yellow-50' }
    if (systolic < 140 || diastolic < 90) return { label: 'Hipertensión Etapa 1', color: 'text-orange-600 bg-orange-50' }
    if (systolic >= 140 || diastolic >= 90) return { label: 'Hipertensión Etapa 2', color: 'text-red-600 bg-red-50' }
    return null
  }

  const getBloodSugarStatus = (value: number | null, type: string) => {
    if (!value) return null
    let normalMax = 100
    if (type === 'ayunas') normalMax = 100
    else if (type === 'postprandial') normalMax = 140
    else normalMax = 140

    if (value < normalMax) return { label: 'Normal', color: 'text-green-600 bg-green-50' }
    if (value < 126) return { label: 'Prediabetes', color: 'text-yellow-600 bg-yellow-50' }
    return { label: 'Diabetes', color: 'text-red-600 bg-red-50' }
  }

  const bpStatus = patient ? getBloodPressureStatus(patient.bloodPressure.systolic, patient.bloodPressure.diastolic) : null
  const bsStatus = patient ? getBloodSugarStatus(patient.bloodSugar.value, patient.bloodSugar.type) : null

  const bloodSugarTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      ayunas: 'En Ayunas',
      postprandial: 'Postprandial',
      aleatorio: 'Aleatorio',
    }
    return types[type] || type || 'N/A'
  }

  const handleEditInfo = async () => {
    if (!patient || !editInfoInput.trim()) return

    setIsAdding(true)
    setError(null)

    try {
      const currentList = editInfoType === 'allergies' ? patient.allergies :
                        editInfoType === 'diseases' ? patient.diseases :
                        patient.medications

      const newList = [...currentList, editInfoInput.trim()]

      const response = await fetch(`/api/patients/${patient.cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [editInfoType]: newList
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar')
      }

      setPatient({ ...patient, [editInfoType]: newList })
      setEditInfoInput('')
      setShowEditInfoModal(false)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado')
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveInfoItem = async (type: 'allergies' | 'diseases' | 'medications', index: number) => {
    if (!patient) return

    setIsAdding(true)
    setError(null)

    try {
      const currentList = patient[type]
      const newList = currentList.filter((_, i) => i !== index)

      const response = await fetch(`/api/patients/${patient.cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type]: newList
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar')
      }

      setPatient({ ...patient, [type]: newList })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado')
      }
    } finally {
      setIsAdding(false)
    }
  }

  const openEditModal = (type: 'allergies' | 'diseases' | 'medications') => {
    setEditInfoType(type)
    setEditInfoInput('')
    setShowEditInfoModal(true)
  }

  const openEditPatientModal = () => {
    if (!patient) return
    setEditPatientData({
      name: patient.name,
      lastName: patient.lastName,
      phone: patient.phone,
      birthDate: patient.birthDate || '',
      weight: patient.weight?.toString() || '',
      height: patient.height?.toString() || '',
      cedula: patient.cedula,
    })
    setShowEditPatientModal(true)
  }

  const addProductToPending = () => {
    if (!selectedProductId) return
    const product = products.find(p => p._id === selectedProductId)
    if (!product) return
    setPendingProducts(prev => [...prev, {
      productId: product._id,
      productName: product.name,
      quantity: productQuantity,
    }])
    setSelectedProductId('')
    setProductQuantity(1)
  }

  const removePendingProduct = (index: number) => {
    setPendingProducts(prev => prev.filter((_, i) => i !== index))
  }

  const saveConsumedProducts = async () => {
    if (!patient || pendingProducts.length === 0) return
    setIsAdding(true)
    setError(null)
    try {
      const now = new Date().toISOString()
      const productsToSave = pendingProducts.map(p => ({
        ...p,
        recordedAt: now,
      }))
      const response = await fetch(`/api/patients/${patient.cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consumedProducts: productsToSave }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Error al guardar productos')
      }
      setPatient(result.patient)
      setPendingProducts([])
      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 3000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado')
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditPatient = async () => {
    if (!patient) return

    setIsAdding(true)
    setError(null)

    try {
      const response = await fetch(`/api/patients/${patient.cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editPatientData.name,
          lastName: editPatientData.lastName,
          phone: editPatientData.phone,
          birthDate: editPatientData.birthDate,
          weight: editPatientData.weight ? parseFloat(editPatientData.weight) : null,
          height: editPatientData.height ? parseFloat(editPatientData.height) : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar')
      }

      setPatient({ 
        ...patient, 
        name: editPatientData.name,
        lastName: editPatientData.lastName,
        phone: editPatientData.phone,
        birthDate: editPatientData.birthDate,
        weight: editPatientData.weight ? parseFloat(editPatientData.weight) : null,
        height: editPatientData.height ? parseFloat(editPatientData.height) : null,
      })
      setShowEditPatientModal(false)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado')
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              ← Volver
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900">Historial del Paciente</h1>
          <p className="mt-2 text-sm text-gray-600">
            Busque un paciente por su número de cédula para ver y agregar mediciones médicas
          </p>
        </div>

        <form onSubmit={handleSearchSubmit(searchPatient)} className="mb-8 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Cédula del Paciente</label>
            <div className="mt-1 flex gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerSearch('cedula')}
                  placeholder="Ingrese la cédula (ej: 12345678)"
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-70"
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {searchErrors.cedula && <p className="mt-1 text-sm text-red-600">{searchErrors.cedula.message}</p>}
          </div>
        </form>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {patient && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <User className="h-5 w-5 text-indigo-600" />
                  Datos Personales
                </div>
                <button
                  onClick={openEditPatientModal}
                  className="rounded-md bg-indigo-100 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-200"
                >
                  Modificar
                </button>
                <span className="text-sm text-gray-500">
                  Registrado: {formatDate(patient.createdAt)}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nombre Completo</p>
                    <p className="font-medium text-gray-900">{patient.name} {patient.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <span className="text-sm font-bold text-indigo-600">ID</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cédula</p>
                    <p className="font-medium text-gray-900">{patient.cedula}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                    <p className="font-medium text-gray-900">{formatDate(patient.birthDate) || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <Phone className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{patient.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Scale className="h-5 w-5 text-indigo-600" />
                    Peso y Altura
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{patient.weight ?? '--'}</p>
                    <p className="text-xs text-gray-500">Peso (kg)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{patient.height ?? '--'}</p>
                    <p className="text-xs text-gray-500">Altura (cm)</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Heart className="h-5 w-5 text-red-500" />
                    Tensión Arterial
                  </div>
                  <span className="text-xs text-gray-400">
                    {(patient.bloodPressureHistory?.length || 0)} registro{(patient.bloodPressureHistory?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {patient.bloodPressure.systolic ?? '--'}/{patient.bloodPressure.diastolic ?? '--'}
                  </p>
                  <p className="text-sm text-gray-500">mmHg</p>
                  {bpStatus && (
                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${bpStatus.color}`}>
                      {bpStatus.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Azúcar en Sangre
                  </div>
                  <span className="text-xs text-gray-400">
                    {(patient.bloodSugarHistory?.length || 0)} registro{(patient.bloodSugarHistory?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{patient.bloodSugar.value ?? '--'}</p>
                  <p className="text-sm text-gray-500">mg/dL ({bloodSugarTypeLabel(patient.bloodSugar.type)})</p>
                  {bsStatus && (
                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${bsStatus.color}`}>
                      {bsStatus.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Droplets className="h-5 w-5 text-purple-500" />
                    Hemograma
                  </div>
                  <span className="text-xs text-gray-400">
                    {(patient.hemogramHistory?.length || 0)} registro{(patient.hemogramHistory?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">
                    {patient.hemogram.hemoglobin ?? '--'}
                  </p>
                  <p className="text-sm text-gray-500">Hemoglobina (g/dL)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setMeasurementType('bloodPressure')
                  resetMeasurement()
                  setShowAddModal(true)
                }}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                <Plus className="h-4 w-4" />
                Agregar Tensión
              </button>
              <button
                onClick={() => {
                  setMeasurementType('bloodSugar')
                  resetMeasurement()
                  setShowAddModal(true)
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                Agregar Azúcar
              </button>
              <button
                onClick={() => {
                  setMeasurementType('hemogram')
                  resetMeasurement()
                  setShowAddModal(true)
                }}
                className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
              >
                <Plus className="h-4 w-4" />
                Agregar Hemograma
              </button>
              <button
                onClick={() => {
                  setMeasurementType('weight')
                  resetMeasurement()
                  setShowAddModal(true)
                }}
                className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                <Plus className="h-4 w-4" />
                Agregar Peso
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <button
                  onClick={() => setExpandedBpHistory(!expandedBpHistory)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    Historial de Tensión Arterial
                  </div>
                  {expandedBpHistory ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedBpHistory && (
                  <div className="mt-4">
                    {patient.bloodPressureHistory.length > 0 ? (
                      <>
                        <div className="mb-4">
                          <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={sortByDateAsc(patient.bloodPressureHistory)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="recordedAt" tickFormatter={formatChartDate} tick={{ fontSize: 11 }} />
                              <YAxis domain={[40, 200]} tick={{ fontSize: 11 }} />
                              <Tooltip labelFormatter={tooltipLabel} />
                              <Legend />
                              <ReferenceLine y={120} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Sistólica normal', position: 'right', fontSize: 10 }} />
                              <ReferenceLine y={140} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Hipertensión Etapa 1', position: 'right', fontSize: 10 }} />
                              <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Diastólica normal', position: 'right', fontSize: 10 }} />
                              <ReferenceLine y={90} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Hipertensión Etapa 1', position: 'right', fontSize: 10 }} />
                              <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Sistólica" strokeWidth={2} dot={{ r: 3 }} />
                              <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastólica" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                        {sortByDateDesc(patient.bloodPressureHistory).map((record) => {
                          const status = getBloodPressureStatus(record.systolic, record.diastolic)
                          return (
                            <div key={record._id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {record.systolic}/{record.diastolic} mmHg
                                </p>
                                <p className="text-xs text-gray-500">{formatDateTime(record.recordedAt)}</p>
                              </div>
                              {status && (
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                                  {status.label}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-400">Sin registros de tensión </p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <button
                  onClick={() => setExpandedBsHistory(!expandedBsHistory)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Historial de Azúcar en Sangre
                  </div>
                  {expandedBsHistory ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedBsHistory && (
                  <div className="mt-4">
                    {patient.bloodSugarHistory.length > 0 ? (
                      <>
                        <div className="mb-4">
                          <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={sortByDateAsc(patient.bloodSugarHistory)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="recordedAt" tickFormatter={formatChartDate} tick={{ fontSize: 11 }} />
                              <YAxis domain={[0, 300]} tick={{ fontSize: 11 }} />
                              <Tooltip labelFormatter={tooltipLabel} />
                              <Legend />
                              <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Normal (ayunas)', position: 'right', fontSize: 10 }} />
                              <ReferenceLine y={126} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Diabetes', position: 'right', fontSize: 10 }} />
                              <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Glucosa" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                        {sortByDateDesc(patient.bloodSugarHistory).map((record) => {
                          const status = getBloodSugarStatus(record.value, record.type)
                          return (
                            <div key={record._id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {record.value} mg/dL
                                </p>
                                <p className="text-xs text-gray-500">{bloodSugarTypeLabel(record.type)} - {formatDateTime(record.recordedAt)}</p>
                              </div>
                              {status && (
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                                  {status.label}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-400">Sin registros de azúcar en sangre</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <button
                onClick={() => setExpandedHgHistory(!expandedHgHistory)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Historial de Hemogramas
                </div>
                {expandedHgHistory ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedHgHistory && (
                <div className="mt-4">
                  {patient.hemogramHistory.length > 0 ? (
                    <>
                      <div className="mb-4">
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={sortByDateAsc(patient.hemogramHistory)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="recordedAt" tickFormatter={formatChartDate} tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                            <Tooltip labelFormatter={tooltipLabel} />
                            <Legend />
                            <ReferenceLine yAxisId="left" y={12} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Hb normal mín', position: 'right', fontSize: 10 }} />
                            <ReferenceLine yAxisId="left" y={16} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Hb normal máx', position: 'right', fontSize: 10 }} />
                            <Line yAxisId="left" type="monotone" dataKey="hemoglobin" stroke="#8b5cf6" name="Hemoglobina (g/dL)" strokeWidth={2} dot={{ r: 3 }} />
                            <Line yAxisId="right" type="monotone" dataKey="whiteBloodCells" stroke="#f59e0b" name="Leucocitos (×10³)" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                      {sortByDateDesc(patient.hemogramHistory).map((record) => (
                        <div key={record._id} className="mb-4 rounded-lg bg-gray-50 p-4">
                          <p className="mb-2 text-sm font-medium text-gray-500">{formatDateTime(record.recordedAt)}</p>
                          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{record.redBloodCells ?? '--'}</p>
                              <p className="text-xs text-gray-500">Glóbulos Rojos</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{record.whiteBloodCells ?? '--'}</p>
                              <p className="text-xs text-gray-500">Glóbulos Blancos</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{record.platelets ?? '--'}</p>
                              <p className="text-xs text-gray-500">Plaquetas</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{record.hemoglobin ?? '--'}</p>
                              <p className="text-xs text-gray-500">Hemoglobina</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{record.hematocrit ?? '--'}</p>
                              <p className="text-xs text-gray-500">Hematocrito</p>
                            </div>
                          </div>
                          {record.observations && (
                            <p className="mt-2 text-sm text-gray-600">Obs: {record.observations}</p>
                          )}
                        </div>
                      ))}
                    </div>
                      </>
                    ) : (
                    <p className="text-center text-gray-400">Sin registros de hemograma</p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <button
                onClick={() => setExpandedWeightHistory(!expandedWeightHistory)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Historial de Peso
                </div>
                {expandedWeightHistory ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedWeightHistory && (
                <div className="mt-4">
                  {patient.weightHistory.length > 0 ? (
                    <>
                      <div className="mb-4">
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={sortByDateAsc(patient.weightHistory)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="recordedAt" tickFormatter={formatChartDate} tick={{ fontSize: 11 }} />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                            <Tooltip labelFormatter={tooltipLabel} />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#22c55e" name="Peso (kg)" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                      {sortByDateDesc(patient.weightHistory).map((record) => (
                        <div key={record._id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                          <div>
                            <p className="font-medium text-gray-900">{record.value} kg</p>
                            <p className="text-xs text-gray-500">{formatDateTime(record.recordedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    </>
                  ) : (
                    <p className="text-center text-gray-400">Sin registros de peso</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Alergias
                  </div>
                  <button
                    onClick={() => openEditModal('allergies')}
                    className="rounded-full bg-orange-100 p-1 text-orange-600 hover:bg-orange-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <span key={index} className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                        {allergy}
                        <button
                          onClick={() => handleRemoveInfoItem('allergies', index)}
                          className="ml-1 text-orange-500 hover:text-orange-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">Sin alergias registradas</p>
                )}
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Enfermedades Padecidas
                  </div>
                  <button
                    onClick={() => openEditModal('diseases')}
                    className="rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {patient.diseases.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.diseases.map((disease, index) => (
                      <span key={index} className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                        {disease}
                        <button
                          onClick={() => handleRemoveInfoItem('diseases', index)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">Sin enfermedades registradas</p>
                )}
              </div>

              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Pill className="h-5 w-5 text-indigo-600" />
                    Medicamentos Actuales
                  </div>
                  <button
                    onClick={() => openEditModal('medications')}
                    className="rounded-full bg-blue-100 p-1 text-blue-600 hover:bg-blue-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {patient.medications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.medications.map((medication, index) => (
                      <span key={index} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                        {medication}
                        <button
                          onClick={() => handleRemoveInfoItem('medications', index)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">Sin medicamentos registrados</p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <button
                onClick={() => setExpandedProductsHistory(!expandedProductsHistory)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Productos Consumidos
                </div>
                {expandedProductsHistory ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedProductsHistory && (
                <div className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} {p.brand ? `- ${p.brand}` : ''}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(Number(e.target.value))}
                      className="w-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                      placeholder="Cant."
                    />
                    <button
                      type="button"
                      onClick={addProductToPending}
                      disabled={!selectedProductId}
                      className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {pendingProducts.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Producto</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Cantidad</th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {pendingProducts.map((pp, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 text-sm text-gray-900">{pp.productName}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{pp.quantity}</td>
                              <td className="px-4 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => removePendingProduct(i)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {(patient.consumedProductsHistory?.length || 0) + pendingProducts.length} registro{(patient.consumedProductsHistory?.length || 0) + pendingProducts.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={saveConsumedProducts}
                      disabled={isAdding || pendingProducts.length === 0}
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-70"
                    >
                      {isAdding ? 'Guardando...' : 'Guardar Productos'}
                    </button>
                  </div>

                  {patient.consumedProductsHistory && patient.consumedProductsHistory.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">Historial de productos:</p>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {patient.consumedProductsHistory.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()).map((record) => (
                          <div key={record._id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm">
                            <span className="font-medium text-gray-900">{record.productName}</span>
                            <span className="text-gray-500">
                              Cant: {record.quantity} — {formatDateTime(record.recordedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {patient.observations && (
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  Observaciones Generales
                </div>
                <p className="whitespace-pre-wrap text-gray-700">{patient.observations}</p>
              </div>
            )}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Agregar {measurementType === 'bloodPressure' ? 'Tensión Arterial' : measurementType === 'bloodSugar' ? 'Azúcar en Sangre' : measurementType === 'hemogram' ? 'Hemograma' : 'Peso'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {addSuccess && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                  Medición agregada exitosamente
                </div>
              )}

              <form className="space-y-4">
                <input type="hidden" {...registerMeasurement('type')} value={measurementType} />

                {measurementType === 'weight' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Peso (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...registerMeasurement('weight')}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                )}

                {measurementType === 'bloodPressure' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Presión Sistólica (mmHg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...registerMeasurement('bloodPressure.systolic')}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                      {measurementErrors.bloodPressure?.systolic && (
                        <p className="mt-1 text-sm text-red-600">{measurementErrors.bloodPressure.systolic.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Presión Diastólica (mmHg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...registerMeasurement('bloodPressure.diastolic')}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                      {measurementErrors.bloodPressure?.diastolic && (
                        <p className="mt-1 text-sm text-red-600">{measurementErrors.bloodPressure.diastolic.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {measurementType === 'bloodSugar' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nivel de Glucosa (mg/dL) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...registerMeasurement('bloodSugar.value')}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                      {measurementErrors.bloodSugar?.value && (
                        <p className="mt-1 text-sm text-red-600">{measurementErrors.bloodSugar.value.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Medición <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...registerMeasurement('bloodSugar.type')}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Seleccionar</option>
                        <option value="ayunas">En Ayunas</option>
                        <option value="postprandial">Postprandial</option>
                        <option value="aleatorio">Aleatorio</option>
                      </select>
                      {measurementErrors.bloodSugar?.type && (
                        <p className="mt-1 text-sm text-red-600">{measurementErrors.bloodSugar.type.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {measurementType === 'hemogram' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Glóbulos Rojos (M/μL)</label>
                        <input
                          type="number"
                          step="0.01"
                          {...registerMeasurement('hemogram.redBloodCells')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Glóbulos Blancos (K/μL)</label>
                        <input
                          type="number"
                          step="0.1"
                          {...registerMeasurement('hemogram.whiteBloodCells')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Plaquetas (K/μL)</label>
                        <input
                          type="number"
                          {...registerMeasurement('hemogram.platelets')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hemoglobina (g/dL)</label>
                        <input
                          type="number"
                          step="0.1"
                          {...registerMeasurement('hemogram.hemoglobin')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hematocrito (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          {...registerMeasurement('hemogram.hematocrit')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                      <textarea
                        {...registerMeasurement('hemogram.observations')}
                        rows={2}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={submitMeasurement}
                    disabled={isAdding}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
                  >
                    {isAdding ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {showEditInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Agregar {editInfoType === 'allergies' ? 'Alergia' : editInfoType === 'diseases' ? 'Enfermedad' : 'Medicamento'}
              </h2>
              <button
                onClick={() => setShowEditInfoModal(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {editInfoType === 'allergies' ? 'Alergia' : editInfoType === 'diseases' ? 'Enfermedad' : 'Medicamento'}
                </label>
                <input
                  type="text"
                  value={editInfoInput}
                  onChange={(e) => setEditInfoInput(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder={editInfoType === 'allergies' ? 'Ej: Penicilina' : editInfoType === 'diseases' ? 'Ej: Diabetes' : 'Ej: Metformina'}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditInfoModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEditInfo}
                  disabled={isAdding || !editInfoInput.trim()}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
                >
                  {isAdding ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Modificar Datos del Paciente
              </h2>
              <button
                onClick={() => setShowEditPatientModal(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cédula</label>
                <input
                  type="text"
                  value={editPatientData.cedula}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={editPatientData.name}
                  onChange={(e) => setEditPatientData({ ...editPatientData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  type="text"
                  value={editPatientData.lastName}
                  onChange={(e) => setEditPatientData({ ...editPatientData, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="text"
                  value={editPatientData.phone}
                  onChange={(e) => setEditPatientData({ ...editPatientData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={editPatientData.birthDate}
                  onChange={(e) => setEditPatientData({ ...editPatientData, birthDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editPatientData.weight}
                    onChange={(e) => setEditPatientData({ ...editPatientData, weight: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editPatientData.height}
                    onChange={(e) => setEditPatientData({ ...editPatientData, height: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditPatientModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEditPatient}
                  disabled={isAdding || !editPatientData.name.trim() || !editPatientData.lastName.trim() || !editPatientData.phone.trim()}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
                >
                  {isAdding ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}