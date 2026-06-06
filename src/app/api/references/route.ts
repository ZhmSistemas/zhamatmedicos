import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ReferenceModel, { DEFAULT_REFERENCE_STANDARDS } from '@/lib/models/ReferenceModel'

export async function GET() {
  try {
    await dbConnect()
    let reference = await ReferenceModel.findOne({ name: 'default' }).lean()

    if (!reference) {
      reference = await ReferenceModel.create({
        name: 'default',
        bloodPressure: DEFAULT_REFERENCE_STANDARDS.bloodPressure,
        bloodSugar: DEFAULT_REFERENCE_STANDARDS.bloodSugar,
        hemogram: DEFAULT_REFERENCE_STANDARDS.hemogram,
      })
    }

    return NextResponse.json(reference, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    await dbConnect()

    const updatedReference = await ReferenceModel.findOneAndUpdate(
      { name: 'default' },
      { $set: body },
      { new: true, upsert: true }
    ).lean()

    return NextResponse.json(updatedReference, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
