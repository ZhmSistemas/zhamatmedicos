import mongoose from 'mongoose'

let cached: mongoose.Connection | null = null

export default async function dbConnectLocal(): Promise<mongoose.Connection> {
  if (cached && cached.readyState === 1) return cached

  const uri = process.env.MONGODB_URI2
  if (!uri) {
    throw new Error('MONGODB_URI2 no está definida en .env')
  }

  cached = await mongoose.createConnection(uri).asPromise()
  return cached
}
