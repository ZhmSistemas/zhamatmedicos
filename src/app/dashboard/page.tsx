'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Search, Edit3, Activity, Users, Heart, Droplets, TrendingUp, AlertCircle, Brain, Package } from 'lucide-react'
import PatientForm from '@/components/patients/PatientForm'
import PatientHistory from '@/components/patients/PatientHistory'
import PatientList from '@/components/patients/PatientList'
import MedicalAIConsultant from '@/components/ai/MedicalAIConsultant'
import ProductDashboardList from '@/components/productos/ProductDashboardList'
import { Patient } from '@/lib/models/PatientModel'

type ActionType = 'create' | 'search' | 'edit' | 'list' | 'ai-consultant' | 'list-products' | null

interface SelectedPatient {
  cedula: string
  name: string
  lastName: string
}

interface ExtendedSelectedPatient extends Patient {
  cedula: string
}

const BLOOD_PRESSURE_STANDARDS = {
  normal: { systolic: [90, 120], diastolic: [60, 80], label: 'Normal', color: 'text-green-600 bg-green-100' },
  elevated: { systolic: [120, 129], diastolic: [60, 80], label: 'Elevada', color: 'text-yellow-600 bg-yellow-100' },
  high1: { systolic: [130, 139], diastolic: [80, 89], label: '高血压 (Grado 1)', color: 'text-orange-600 bg-orange-100' },
  high2: { systolic: [140, 180], diastolic: [90, 120], label: '高血压 (Grado 2)', color: 'text-red-600 bg-red-100' },
  crisis: { systolic: [180, 250], diastolic: [120, 150], label: 'Crisis Hipertensiva', color: 'text-red-900 bg-red-200' },
}

const BLOOD_SUGAR_STANDARDS = {
  normal: { min: 70, max: 100, type: 'ayunas', label: 'Normal', color: 'text-green-600 bg-green-100' },
  prediabetes: { min: 100, max: 126, type: 'ayunas', label: 'Prediabetes', color: 'text-yellow-600 bg-yellow-100' },
  diabetes: { min: 126, max: 250, type: 'ayunas', label: 'Diabetes', color: 'text-red-600 bg-red-100' },
}

const HEMOGRAM_STANDARDS = {
  redBloodCells: { min: 4.0, max: 5.5, unit: 'M/μL', label: 'Glóbulos Rojos', color: 'text-green-600' },
  whiteBloodCells: { min: 4, max: 11, unit: 'K/μL', label: 'Glóbulos Blancos', color: 'text-green-600' },
  platelets: { min: 150, max: 400, unit: 'K/μL', label: 'Plaquetas', color: 'text-green-600' },
  hemoglobin: { min: 12, max: 17.5, unit: 'g/dL', label: 'Hemoglobina', color: 'text-green-600' },
  hematocrit: { min: 36, max: 50, unit: '%', label: 'Hematocrito', color: 'text-green-600' },
}

export default function DashboardPage() {
  const [activeAction, setActiveAction] = useState<ActionType>(null)
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null)
  const [patientData, setPatientData] = useState<ExtendedSelectedPatient | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [patientCount, setPatientCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/patients/count')
      .then(res => res.json())
      .then(data => setPatientCount(data.count ?? 0))
      .catch(() => setPatientCount(0))
  }, [refreshKey])

  const menuItems = [
    { id: 'inicio' as ActionType, label: 'Referencias', icon: UserPlus, color: 'bg-green-500 hover:bg-green-600' },
    { id: 'create' as ActionType, label: 'Crear Paciente', icon: UserPlus, color: 'bg-green-500 hover:bg-green-600' },
    { id: 'search' as ActionType, label: 'Buscar Historial', icon: Search, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'edit' as ActionType, label: 'Modificar Paciente', icon: Edit3, color: 'bg-orange-500 hover:bg-orange-600' },
    { id: 'list' as ActionType, label: 'Lista de Pacientes', icon: Users, color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'ai-consultant' as ActionType, label: 'Consultor IA', icon: Brain, color: 'bg-indigo-500 hover:bg-indigo-600' },
    { id: 'list-products' as ActionType, label: 'Productos', icon: Package, color: 'bg-teal-500 hover:bg-teal-600' },
  ]

  const handlePatientSelect = (patient: { cedula: string; name: string; lastName: string }) => {
    setSelectedPatient(patient)
    setActiveAction('edit')
  }

  const handleAIConsultation = async (cedula: string) => {
    try {
      const response = await fetch(`/api/patients/${cedula}`)
      if (response.ok) {
        const data = await response.json()
        setPatientData(data.patient ?? data)
        setActiveAction('ai-consultant')
      }
    } catch (error) {
      console.error('Error cargando datos del paciente:', error)
    }
  }

  const handleBack = () => {
    setSelectedPatient(null)
    setPatientData(null)
    setActiveAction(null)
    setRefreshKey((k) => k + 1)
  }

  const handlePatientCreated = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Pacientes</h1>
          <p className="mt-1 text-sm text-gray-600">Gestione la información de sus pacientes</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Activity className="h-5 w-5 text-indigo-600" />
                Acciones
              </h2>
              <div className="space-y-2">
                {menuItems.map((item) =>
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveAction(item.id)
                      if (item.id !== 'list' && item.id !== 'search') {
                        setSelectedPatient(null)
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-white transition-all ${
                      activeAction === item.id
                        ? item.color + ' ring-2 ring-offset-2 ring-indigo-500'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="rounded-xl bg-white p-6 shadow-lg min-h-150">
            {activeAction === 'create' ? (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <button
                      onClick={() => setActiveAction(null)}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      ← Volver
                    </button>
                  </div>
                  <PatientForm onSuccess={handlePatientCreated} />
                </div>
              ) : activeAction === 'search' || activeAction === 'edit' ? (
                <div key={refreshKey}>
                  <PatientHistory 
                    initialCedula={selectedPatient?.cedula} 
                    onBack={handleBack}
                  />
                </div>
              ) : activeAction === 'list' ? (
                <div key={refreshKey}>
                  <PatientList onSelectPatient={handlePatientSelect} />
                </div>
              ) : activeAction === 'list-products' ? (
                <div key={refreshKey}>
                  <ProductDashboardList />
                </div>
              ) : activeAction === 'ai-consultant' ? (
                patientData ? (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <button
                        onClick={handleBack}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                      >
                        ← Volver
                      </button>
                      <span className="text-sm text-gray-600">
                        Consultando: {patientData.name} {patientData.lastName}
                      </span>
                    </div>
                    <div className="h-175">
                      <MedicalAIConsultant patient={patientData} />
                    </div>
                  </div>
                ) : (
                  <div key={refreshKey}>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona un Paciente</h3>
                    </div>
                    <PatientList onSelectPatient={(patient) => {
                      handleAIConsultation(patient.cedula)
                    }} />
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div
                      onClick={() => setActiveAction('list')}
                      className="cursor-pointer rounded-lg bg-linear-to-r from-indigo-500 to-indigo-600 p-4 text-white transition-transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8" />
                        <div>
                          <p className="text-2xl font-bold">{patientCount}</p>
                          <p className="text-sm opacity-90">Pacientes Registrados</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-linear-to-r from-green-500 to-green-600 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <Heart className="h-8 w-8" />
                        <div>
                          <p className="text-2xl font-bold">{BLOOD_PRESSURE_STANDARDS.normal.label}</p>
                          <p className="text-sm opacity-90">Tensión Normal</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-linear-to-r from-blue-500 to-blue-600 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <Droplets className="h-8 w-8" />
                        <div>
                          <p className="text-2xl font-bold">{BLOOD_SUGAR_STANDARDS.normal.label}</p>
                          <p className="text-sm opacity-90">Glucosa Normal</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <AlertCircle className="h-5 w-5 text-indigo-600" />
                      Parámetros de Referencia - Tensión Arterial
                    </h3>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                      {Object.entries(BLOOD_PRESSURE_STANDARDS).map(([key, val]) => (
                        <div key={key} className={`rounded-lg p-2 ${val.color}`}>
                          <p className="text-xs font-medium">{val.label}</p>
                          <p className="text-lg font-bold">{val.systolic[0]}-{val.systolic[1]}/{val.diastolic[0]}-{val.diastolic[1]}</p>
                          <p className="text-xs">mmHg</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      Parámetros de Referencia - Glucosa en Sangre (mg/dL)
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-green-100 p-2 text-green-700">
                        <p className="text-xs font-medium">Normal</p>
                        <p className="text-lg font-bold">70-100</p>
                        <p className="text-xs">En ayunas</p>
                      </div>
                      <div className="rounded-lg bg-yellow-100 p-2 text-yellow-700">
                        <p className="text-xs font-medium">Prediabetes</p>
                        <p className="text-lg font-bold">100-126</p>
                        <p className="text-xs">En ayunas</p>
                      </div>
                      <div className="rounded-lg bg-red-100 p-2 text-red-700">
                        <p className="text-xs font-medium">Diabetes</p>
                        <p className="text-lg font-bold">≥126</p>
                        <p className="text-xs">En ayunas</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Parámetros de Referencia - Hemograma
                    </h3>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                      {Object.entries(HEMOGRAM_STANDARDS).map(([key, val]) => (
                        <div key={key} className="rounded-lg bg-gray-50 p-2">
                          <p className="text-xs font-medium text-gray-600">{val.label}</p>
                          <p className={`text-lg font-bold ${val.color}`}>{val.min}-{val.max}</p>
                          <p className="text-xs text-gray-500">{val.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <PatientList onSelectPatient={(patient) => {
                    setSelectedPatient(patient)
                    setActiveAction('edit')
                  }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}