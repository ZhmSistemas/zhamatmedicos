import mongoose from 'mongoose'

export type Patient = {
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
  hemogramHistory: Array<{
    _id: string
    redBloodCells: number | null
    whiteBloodCells: number | null
    platelets: number | null
    hemoglobin: number | null
    hematocrit: number | null
    observations: string
    recordedAt: string
  }>
  bloodPressureHistory: Array<{
    _id: string
    systolic: number | null
    diastolic: number | null
    recordedAt: string
  }>
  bloodSugarHistory: Array<{
    _id: string
    value: number | null
    type: string
    recordedAt: string
  }>
  weightHistory: Array<{
    _id: string
    value: number | null
    recordedAt: string
  }>
  consumedProducts: Array<{
    productId: string
    productName: string
    quantity: number
    recordedAt: string
  }>
  consumedProductsHistory: Array<{
    _id: string
    productId: string
    productName: string
    quantity: number
    recordedAt: string
  }>
}

const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    cedula: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    birthDate: { type: String, default: '' },
    gender: { type: String, default: '' },
    address: { type: String, default: '' },
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    diseases: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    medications: { type: [String], default: [] },
    hemogram: {
      redBloodCells: { type: Number, default: null },
      whiteBloodCells: { type: Number, default: null },
      platelets: { type: Number, default: null },
      hemoglobin: { type: Number, default: null },
      hematocrit: { type: Number, default: null },
      observations: { type: String, default: '' },
    },
    bloodPressure: {
      systolic: { type: Number, default: null },
      diastolic: { type: Number, default: null },
      measuredAt: { type: String, default: '' },
    },
    bloodSugar: {
      value: { type: Number, default: null },
      type: { type: String, default: '' },
      measuredAt: { type: String, default: '' },
    },
    observations: { type: String, default: '' },
    hemogramHistory: {
      type: [{
        redBloodCells: { type: Number, default: null },
        whiteBloodCells: { type: Number, default: null },
        platelets: { type: Number, default: null },
        hemoglobin: { type: Number, default: null },
        hematocrit: { type: Number, default: null },
        observations: { type: String, default: '' },
        recordedAt: { type: String, default: '' },
      }],
      default: [],
    },
    bloodPressureHistory: {
      type: [{
        systolic: { type: Number, default: null },
        diastolic: { type: Number, default: null },
        recordedAt: { type: String, default: '' },
      }],
      default: [],
    },
    bloodSugarHistory: {
      type: [{
        value: { type: Number, default: null },
        type: { type: String, default: '' },
        recordedAt: { type: String, default: '' },
      }],
      default: [],
    },
    weightHistory: {
      type: [{
        value: { type: Number, default: null },
        recordedAt: { type: String, default: '' },
      }],
      default: [],
    },
    consumedProducts: {
      type: [{
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        recordedAt: { type: String, default: '' },
      }],
      default: [],
    },
    consumedProductsHistory: {
      type: [{
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        recordedAt: { type: String, default: '' },
      }],
      default: [],
    },
  },
  { timestamps: true }
)

const PatientModel = mongoose.models?.Patient || mongoose.model('Patient', PatientSchema)

export default PatientModel