'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Search, Edit3, LayoutDashboard, Users, Heart, Droplets, TrendingUp, Brain, Package, ArrowLeft, Activity, Gauge, ChevronRight } from 'lucide-react'
import PatientForm from '@/components/patients/PatientForm'
import PatientHistory from '@/components/patients/PatientHistory'
import PatientList from '@/components/patients/PatientList'
import MedicalAIConsultant from '@/components/ai/MedicalAIConsultant'
import ProductDashboardList from '@/components/productos/ProductDashboardList'
import { Patient } from '@/lib/models/PatientModel'

type ActionType = 'inicio' | 'create' | 'search' | 'edit' | 'list' | 'ai-consultant' | 'list-products' | null

interface SelectedPatient {
  cedula: string
  name: string
  lastName: string
}

interface ExtendedSelectedPatient extends Patient {
  cedula: string
}

const BLOOD_PRESSURE_STANDARDS = {
  normal: { systolic: [90, 120], diastolic: [60, 80], label: 'Normal', color: 'text-green-700 bg-green-50 border-green-200' },
  elevated: { systolic: [120, 129], diastolic: [60, 80], label: 'Elevada', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  high1: { systolic: [130, 139], diastolic: [80, 89], label: 'Grado 1', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  high2: { systolic: [140, 180], diastolic: [90, 120], label: 'Grado 2', color: 'text-red-700 bg-red-50 border-red-200' },
  crisis: { systolic: [180, 250], diastolic: [120, 150], label: 'Crisis', color: 'text-red-900 bg-red-100 border-red-300' },
}

const BLOOD_SUGAR_STANDARDS = {
  normal: { min: 70, max: 100, type: 'ayunas', label: 'Normal', color: 'text-green-700 bg-green-50 border-green-200' },
  prediabetes: { min: 100, max: 126, type: 'ayunas', label: 'Prediabetes', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  diabetes: { min: 126, max: 250, type: 'ayunas', label: 'Diabetes', color: 'text-red-700 bg-red-50 border-red-200' },
}

const HEMOGRAM_STANDARDS = {
  redBloodCells: { min: 4.0, max: 5.5, unit: 'M/μL', label: 'Glóbulos Rojos', icon: '🩸' },
  whiteBloodCells: { min: 4, max: 11, unit: 'K/μL', label: 'Glóbulos Blancos', icon: '⚪' },
  platelets: { min: 150, max: 400, unit: 'K/μL', label: 'Plaquetas', icon: '🛡️' },
  hemoglobin: { min: 12, max: 17.5, unit: 'g/dL', label: 'Hemoglobina', icon: '🔴' },
  hematocrit: { min: 36, max: 50, unit: '%', label: 'Hematocrito', icon: '💧' },
}

const menuItems = [
  { id: 'inicio' as ActionType, label: 'Referencias', icon: LayoutDashboard, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50', lightText: 'text-emerald-600' },
  { id: 'create' as ActionType, label: 'Crear Paciente', icon: UserPlus, gradient: 'from-green-500 to-emerald-600', lightBg: 'bg-green-50', lightText: 'text-green-600' },
  { id: 'search' as ActionType, label: 'Buscar Historial', icon: Search, gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-blue-50', lightText: 'text-blue-600' },
  { id: 'edit' as ActionType, label: 'Modificar Paciente', icon: Edit3, gradient: 'from-orange-500 to-amber-600', lightBg: 'bg-orange-50', lightText: 'text-orange-600' },
  { id: 'list' as ActionType, label: 'Lista de Pacientes', icon: Users, gradient: 'from-purple-500 to-violet-600', lightBg: 'bg-purple-50', lightText: 'text-purple-600' },
  { id: 'ai-consultant' as ActionType, label: 'Consultor IA', icon: Brain, gradient: 'from-indigo-500 to-blue-600', lightBg: 'bg-indigo-50', lightText: 'text-indigo-600' },
  { id: 'list-products' as ActionType, label: 'Productos', icon: Package, gradient: 'from-teal-500 to-cyan-600', lightBg: 'bg-teal-50', lightText: 'text-teal-600' },
]

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

  const currentMenuItem = menuItems.find(m => m.id === activeAction)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex animate-fade-in-up items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 p-2.5 shadow-lg shadow-indigo-200">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentMenuItem ? currentMenuItem.label : 'Panel de Gestión'}
                </h1>
                <p className="text-sm text-gray-500">
                  {activeAction
                    ? `Administración de ${currentMenuItem?.label?.toLowerCase()}`
                    : 'Gestione la información de sus pacientes'}
                </p>
              </div>
            </div>
          </div>
          {activeAction && activeAction !== 'inicio' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-xs transition-all hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="animate-fade-in-up rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="mb-4 flex items-center gap-2 px-1">
                <div className="rounded-lg bg-indigo-50 p-1.5">
                  <Gauge className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Navegación</span>
              </div>
              <div className="space-y-1.5">
                {menuItems.map((item) => {
                  const isActive = activeAction === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveAction(item.id)
                        if (item.id !== 'list' && item.id !== 'search') {
                          setSelectedPatient(null)
                        }
                      }}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                        isActive
                          ? `bg-linear-to-r ${item.gradient} text-white shadow-sm`
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white" />
                      )}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        isActive ? 'bg-white/20' : `${item.lightBg} group-hover:scale-105`
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          isActive ? 'text-white' : item.lightText
                        }`} />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {!isActive && (
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-gray-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="animate-fade-in-up rounded-2xl bg-white shadow-sm border border-gray-100 min-h-150 [animation-delay:100ms]">
              <div className="p-6">
                {activeAction === 'create' ? (
                  <div>
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
                        <span className="text-sm text-gray-500">
                          Consultando:{' '}
                          <span className="font-medium text-gray-700">
                            {patientData.name} {patientData.lastName}
                          </span>
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div
                        onClick={() => setActiveAction('list')}
                        className="group relative cursor-pointer overflow-hidden rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 p-5 text-white transition-all hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5"
                      >
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
                        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
                        <div className="relative flex items-center gap-4">
                          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-xs">
                            <Users className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold tracking-tight">{patientCount ?? '-'}</p>
                            <p className="text-sm text-white/80">Pacientes Registrados</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs text-white/60 transition-all group-hover:text-white/90">
                          Ver lista <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>

                      <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 p-5 text-white">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
                        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
                        <div className="relative flex items-center gap-4">
                          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-xs">
                            <Heart className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold tracking-tight">{BLOOD_PRESSURE_STANDARDS.normal.label}</p>
                            <p className="text-sm text-white/80">Tensión Normal</p>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-white/60">
                          Sistólica: 90-120 / Diastólica: 60-80 mmHg
                        </div>
                      </div>

                      <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-sky-500 to-blue-600 p-5 text-white">
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
                        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
                        <div className="relative flex items-center gap-4">
                          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-xs">
                            <Droplets className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold tracking-tight">{BLOOD_SUGAR_STANDARDS.normal.label}</p>
                            <p className="text-sm text-white/80">Glucosa Normal</p>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-white/60">
                          70-100 mg/dL en ayunas
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-red-50 p-2">
                          <Heart className="h-5 w-5 text-red-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Parámetros de Referencia — Tensión Arterial</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {Object.entries(BLOOD_PRESSURE_STANDARDS).map(([key, val]) => (
                          <div key={key} className={`rounded-xl border p-3 transition-all hover:shadow-sm ${val.color}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider">{val.label}</span>
                              <span className={`text-[10px] font-medium ${
                                key === 'normal' ? 'text-green-500' :
                                key === 'elevated' ? 'text-yellow-500' :
                                key === 'high1' ? 'text-orange-500' :
                                key === 'high2' ? 'text-red-500' : 'text-red-700'
                              }`}>
                                {key === 'normal' ? '✓' : key === 'crisis' ? '⚠' : '▲'}
                              </span>
                            </div>
                            <p className="mt-1 text-lg font-bold tracking-tight">
                              {val.systolic[0]}-{val.systolic[1]}
                              <span className="text-xs font-normal text-gray-400">/</span>
                              {val.diastolic[0]}-{val.diastolic[1]}
                            </p>
                            <p className="text-[11px] text-gray-400">mmHg</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2">
                          <Droplets className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Parámetros de Referencia — Glucosa en Sangre</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(BLOOD_SUGAR_STANDARDS).map(([key, val]) => (
                          <div key={key} className={`rounded-xl border p-4 transition-all hover:shadow-sm ${val.color}`}>
                            <p className="text-xs font-semibold uppercase tracking-wider">{val.label}</p>
                            <p className="mt-1 text-2xl font-bold tracking-tight">
                              {key === 'diabetes' ? '≥126' : `${val.min}-${val.max}`}
                            </p>
                            <p className="text-xs text-gray-400">mg/dL · En ayunas</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-purple-50 p-2">
                          <TrendingUp className="h-5 w-5 text-purple-500" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Parámetros de Referencia — Hemograma</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {Object.entries(HEMOGRAM_STANDARDS).map(([key, val]) => (
                          <div key={key} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all hover:border-gray-200 hover:shadow-sm">
                            <p className="text-xs font-medium text-gray-500">{val.label}</p>
                            <p className="mt-1 text-lg font-bold text-gray-800">{val.min}-{val.max}</p>
                            <p className="text-xs text-gray-400">{val.unit}</p>
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
    </div>
  )
}