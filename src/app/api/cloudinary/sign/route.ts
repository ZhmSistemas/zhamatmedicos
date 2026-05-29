import { v2 as cloudinary } from 'cloudinary'

export const GET = async () => {
  try {
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    if (!apiKey || !apiSecret || !cloudName) {
      return Response.json({ message: 'Cloudinary no configurado en el servidor' }, { status: 500 })
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    })

    const timestamp = Math.floor(Date.now() / 1000)
    const folder = 'products'
    const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret)

    return Response.json({ signature, timestamp, apiKey, cloudName, folder }, { status: 200 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error generando firma'
    return Response.json({ message: errorMessage }, { status: 500 })
  }
}
