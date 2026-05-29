import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import PatientModel from '@/lib/models/PatientModel'

export const GET = async (_request: NextRequest) => {
  try {
    await dbConnect()
    const count = await PatientModel.countDocuments({})
    return Response.json({ count }, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage, count: 0 }, { status: 200 })
  }
}