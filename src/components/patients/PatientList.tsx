'use client'

import { useState, useEffect } from 'react'
import { Users, Search, User, Phone, Mail, Calendar, ChevronRight, Trash2 } from 'lucide-react'
import { showToast } from 'nextjs-toast-notify'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Patient {
  _id: string
  name: string
  lastName: string
  cedula: string
  email: string
  phone: string
  birthDate: string
  gender: string
  createdAt: string
}

interface PatientListProps {
  onSelectPatient?: (patient: { cedula: string; name: string; lastName: string }) => void
}

export default function PatientList({ onSelectPatient }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/patients')
      const data = await response.json()

      if (response.ok) {
        setPatients(data.patients)
      } else {
        setError(data.message || 'Error al cargar pacientes')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.cedula.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchTerm)
    )
  })

  const handleDelete = (cedula: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDeleteId(cedula)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteId) return

    setDeleting(confirmDeleteId)
    setConfirmDeleteId(null)
    try {
      const res = await fetch(`/api/patients/${confirmDeleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        showToast.error(data.message || 'Error al eliminar')
        return
      }
      setPatients((prev) => prev.filter((p) => p.cedula !== confirmDeleteId))
      showToast.success('Paciente eliminado correctamente.')
    } catch {
      showToast.error('Error de conexión al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-center text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">Lista de Pacientes</h2>
          <span className="rounded-full bg-indigo-100 px-2 py-1 text-sm text-indigo-700">
            {filteredPatients.length}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido, cédula o teléfono..."
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-gray-400">
          <Users className="mb-2 h-12 w-12" />
          <p>{searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}</p>
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto">
          <div className="space-y-2">
            {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  onClick={() => onSelectPatient?.({ cedula: patient.cedula, name: patient.name, lastName: patient.lastName })}
                  className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-indigo-100 p-2">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {patient.name} {patient.lastName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-gray-600">CC:</span> {patient.cedula}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </span>
                        {patient.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(patient.birthDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(patient.cedula, e)}
                      disabled={deleting === patient.cedula}
                      className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
                      title="Eliminar paciente"
                    >
                      <Trash2 className={`h-4 w-4 ${deleting === patient.cedula ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="text-xs text-gray-400">
                      Registrado: {formatDate(patient.createdAt)}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Eliminar paciente"
        message="¿Estás seguro de eliminar este paciente? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        isLoading={deleting !== null}
      />
    </div>
  )
}
