import { NextResponse } from 'next/server'
import { prisma } from '@/packages/database'
import { withErrorHandler, NotFoundError, parsePagination } from '@/lib/errors'

/**
 * GET /api/assets
 * Get creative assets (documents) for Lumora Creations
 */
export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url)
  const { limit, skip } = parsePagination(url)
  const type = url.searchParams.get('type')
  const companySlug = 'lumora-creations'

  const company = await prisma.company.findUnique({ where: { slug: companySlug } })
  if (!company) throw new NotFoundError('Company')

  const where: any = { companyId: company.id }
  if (type) where.type = type

  const [assets, total] = await Promise.all([
    prisma.document.findMany({
      where,
      take: limit,
      skip,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.document.count({ where })
  ])

  return NextResponse.json({
    data: assets,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * POST /api/assets
 * Create a new creative asset
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json()
  const companySlug = 'lumora-creations'

  const company = await prisma.company.findUnique({ where: { slug: companySlug } })
  if (!company) throw new NotFoundError('Company')

  // For demo purposes, we'll create a mock asset
  // In production, this would handle actual file uploads
  const asset = await prisma.document.create({
    data: {
      title: body.title,
      description: body.description,
      type: body.type || 'OTHER',
      filename: body.filename || 'asset.jpg',
      filepath: body.filepath || `/assets/${Date.now()}.jpg`,
      filesize: body.filesize || 0,
      mimeType: body.mimeType || 'image/jpeg',
      url: body.url || `https://storage.lumora.com/${Date.now()}.jpg`,
      companyId: company.id,
      uploadedById: body.uploadedById
    },
    include: {
      uploadedBy: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  return NextResponse.json(asset, { status: 201 })
})
