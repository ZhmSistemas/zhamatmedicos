import dbConnectLocal from '@/lib/dbConnectLocal'
import { getProductModel } from '@/lib/models/ProductLocalModel'

export const GET = async () => {
  try {
    const conn = await dbConnectLocal()
    const ProductModel = getProductModel(conn)
    const products = await ProductModel.find({}).select('name description dirigido uso image_url pricecompra priceventa brand').lean()
    return Response.json({ products }, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}
