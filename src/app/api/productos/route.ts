import dbConnectLocal from '@/lib/dbConnectLocal'
import { getProductModel } from '@/lib/models/ProductLocalModel'

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const search = searchParams.get('search') || ''

    const conn = await dbConnectLocal()
    const ProductModel = getProductModel(conn)

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const baseQuery = ProductModel.find(query)
      .select('name description dirigido uso image_url pricecompra priceventa brand')

    if (search) {
      const products = await baseQuery.lean()
      return Response.json({
        products,
        total: products.length,
        page: 1,
        totalPages: 1,
      }, { status: 200 })
    }

    const [products, total] = await Promise.all([
      baseQuery.skip((page - 1) * limit).limit(limit).lean(),
      ProductModel.countDocuments(query),
    ])

    return Response.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}
