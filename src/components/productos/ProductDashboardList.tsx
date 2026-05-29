'use client'

import { useState, useEffect } from 'react'
import { Package, Search, ArrowLeft } from 'lucide-react'
import { Product } from '@/lib/models/ProductLocalModel'

function ProductDetail({ product, onBack }: { product: Product; onBack: () => void }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={onBack}
          className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
        >
          ← Volver
        </button>
        <span className="text-sm text-gray-600">{product.name}</span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {product.image_url && (
          <div className="mb-6 flex justify-center">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-72 w-full rounded-xl object-cover sm:w-96"
            />
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>

        {product.brand && (
          <p className="mt-1 text-sm text-gray-500">Marca: {product.brand}</p>
        )}

        <div className="mt-4 space-y-3 text-sm text-gray-700">
          {product.description && (
            <p>{product.description}</p>
          )}
          {product.dirigido && (
            <p><span className="font-medium text-gray-900">Dirigido a:</span> {product.dirigido}</p>
          )}
          {product.uso && (
            <p><span className="font-medium text-gray-900">Modo de uso:</span> {product.uso}</p>
          )}
          {product.priceventa != null && (
            <p className="text-lg font-semibold text-teal-600">
              ${Number(product.priceventa).toLocaleString('es-CO')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductDashboardList() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setProducts(data.products)
        } else {
          setError(data.message || 'Error al cargar productos')
        }
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const term = searchTerm.toLowerCase()
    return (
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term)
    )
  })

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-red-400 mt-1">Verifica que MongoDB local esté corriendo en MONGODB_URI2</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Package className="mb-4 h-16 w-16" />
        <p className="text-lg">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((product) => (
          <button
            key={product._id}
            onClick={() => setSelectedProduct(product)}
            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            {product.image_url && (
              <div className="mb-3 flex justify-center">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-40 w-full rounded-lg object-cover"
                />
              </div>
            )}
            <h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
            {product.brand && (
              <p className="mt-0.5 text-xs text-gray-500">{product.brand}</p>
            )}
            {product.priceventa != null && (
              <p className="mt-1 font-semibold text-teal-600">
                ${Number(product.priceventa).toLocaleString('es-CO')}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
