'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Package, Search, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/lib/models/ProductLocalModel'
import Image from 'next/image'

const LIMIT = 12

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex justify-center">
        <div className="h-40 w-full rounded-lg bg-gray-200" />
      </div>
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/3 rounded bg-gray-200" />
    </div>
  )
}

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
        {product.image_url ? (
          <div className="mb-6 flex justify-center">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-72 w-full rounded-xl object-cover sm:w-96"
            />
          </div>
        ) : (
          <div className="mb-6 flex h-72 items-center justify-center rounded-xl bg-gray-100 sm:w-96">
            <Package className="h-16 w-16 text-gray-300" />
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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const fetchProducts = useCallback(async (p: number, search: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) })
      if (search) params.set('search', search)

      const res = await fetch(`/api/productos?${params}`)
      const data = await res.json()

      if (data.products) {
        setProducts(data.products)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } else {
        setError(data.message || 'Error al cargar productos')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts(page, searchTerm)
  }, [page, fetchProducts])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
    }, 300)
  }

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} />
  }

  if (error && products.length === 0) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-red-400 mt-1">Verifica que MongoDB local esté corriendo en MONGODB_URI2</p>
      </div>
    )
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Count */}
      <p className="mb-3 text-xs text-gray-500">
        {isLoading && products.length === 0
          ? 'Cargando productos...'
          : total > 0
            ? `Mostrando ${Math.min((page - 1) * LIMIT + 1, total)}–${Math.min(page * LIMIT, total)} de ${total} producto${total !== 1 ? 's' : ''}`
            : '0 productos'}
      </p>

      {/* Loading */}
      {isLoading && products.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Package className="mb-4 h-16 w-16" />
          <p className="text-lg">{searchTerm ? 'Sin resultados para esta búsqueda' : 'No hay productos disponibles'}</p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <button
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                {product.image_url ? (
                  <div className="mb-3 flex justify-center">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-gray-100">
                    <Package className="h-12 w-12 text-gray-300" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true
                  if (p === 1 || p === totalPages) return true
                  if (Math.abs(p - page) <= 1) return true
                  return false
                })
                .map((p, idx, arr) => (
                  <span key={p} className="contents">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-sm text-gray-400">&hellip;</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      disabled={isLoading}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      aria-label={`Ir a página ${p}`}
                      aria-current={p === page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  </span>
                ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Loading overlay */}
          <div className="mt-4 flex h-6 items-center justify-center">
            {isLoading && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            )}
          </div>
        </>
      )}
    </div>
  )
}
