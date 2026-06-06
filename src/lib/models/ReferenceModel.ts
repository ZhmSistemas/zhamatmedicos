import mongoose from 'mongoose'

export type BloodPressureCategory = {
  systolic: [number, number]
  diastolic: [number, number]
  label: string
  color: string
}

export type BloodSugarCategory = {
  min: number
  max: number
  type: string
  label: string
  color: string
}

export type HemogramField = {
  min: number
  max: number
  unit: string
  label: string
  icon: string
}

export type ReferenceStandards = {
  name: string
  bloodPressure: Record<string, BloodPressureCategory>
  bloodSugar: Record<string, BloodSugarCategory>
  hemogram: Record<string, HemogramField>
}

export const DEFAULT_REFERENCE_STANDARDS: Omit<ReferenceStandards, 'name'> = {
  bloodPressure: {
    normal: { systolic: [90, 120], diastolic: [60, 80], label: 'Normal', color: 'text-green-700 bg-green-50 border-green-200' },
    elevated: { systolic: [120, 129], diastolic: [60, 80], label: 'Elevada', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    high1: { systolic: [130, 139], diastolic: [80, 89], label: 'Grado 1', color: 'text-orange-700 bg-orange-50 border-orange-200' },
    high2: { systolic: [140, 180], diastolic: [90, 120], label: 'Grado 2', color: 'text-red-700 bg-red-50 border-red-200' },
    crisis: { systolic: [180, 250], diastolic: [120, 150], label: 'Crisis', color: 'text-red-900 bg-red-100 border-red-300' },
  },
  bloodSugar: {
    normal: { min: 70, max: 100, type: 'ayunas', label: 'Normal', color: 'text-green-700 bg-green-50 border-green-200' },
    prediabetes: { min: 100, max: 126, type: 'ayunas', label: 'Prediabetes', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    diabetes: { min: 126, max: 250, type: 'ayunas', label: 'Diabetes', color: 'text-red-700 bg-red-50 border-red-200' },
  },
  hemogram: {
    redBloodCells: { min: 4.0, max: 5.5, unit: 'M/μL', label: 'Glóbulos Rojos', icon: '🩸' },
    whiteBloodCells: { min: 4, max: 11, unit: 'K/μL', label: 'Glóbulos Blancos', icon: '⚪' },
    platelets: { min: 150, max: 400, unit: 'K/μL', label: 'Plaquetas', icon: '🛡️' },
    hemoglobin: { min: 12, max: 17.5, unit: 'g/dL', label: 'Hemoglobina', icon: '🔴' },
    hematocrit: { min: 36, max: 50, unit: '%', label: 'Hematocrito', icon: '💧' },
    volumenCorpuscularMedio: { min: 80, max: 100, unit: 'fL', label: 'Volumen Corpuscular Medio (VCM)', icon: '📏' },
    bilirubinaTotal: { min: 0.3, max: 1.2, unit: 'mg/dL', label: 'Bilirrubina Total', icon: '🟡' },
    bilirubinaDirecta: { min: 0, max: 0.3, unit: 'mg/dL', label: 'Bilirrubina Directa', icon: '🟢' },
    bilirubinaIndirecta: { min: 0.2, max: 0.8, unit: 'mg/dL', label: 'Bilirrubina Indirecta', icon: '🟤' },
    nitrogenoUreico: { min: 7, max: 20, unit: 'mg/dL', label: 'Nitrógeno Ureico', icon: '🧪' },
    creatinina: { min: 0.6, max: 1.3, unit: 'mg/dL', label: 'Creatinina', icon: '🧬' },
    hierroTotal: { min: 60, max: 170, unit: 'µg/dL', label: 'Hierro Total', icon: '⚙️' },
  },
}

const ReferenceSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'default', unique: true },
    bloodPressure: { type: Object, default: DEFAULT_REFERENCE_STANDARDS.bloodPressure },
    bloodSugar: { type: Object, default: DEFAULT_REFERENCE_STANDARDS.bloodSugar },
    hemogram: { type: Object, default: DEFAULT_REFERENCE_STANDARDS.hemogram },
  },
  { collection: 'references', timestamps: true }
)

const ReferenceModel = mongoose.models?.Reference || mongoose.model('Reference', ReferenceSchema)

export default ReferenceModel
