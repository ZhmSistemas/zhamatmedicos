import mongoose from 'mongoose'

export type Product = {
  _id: string
  name: string
  description: string
  dirigido: string
  uso: string
  image_url: string
  priceventa: number
  brand: string
}

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  dirigido: String,
  uso: String,
  image_url: String,
  priceventa: Number,
  brand: String,
}, { collection: 'products' })

export function getProductModel(conn: mongoose.Connection) {
  return conn.models['Product'] || conn.model('Product', ProductSchema)
}
