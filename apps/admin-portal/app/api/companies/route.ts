import { NextResponse } from 'next/server'
import { prisma } from '@/packages/database'
import { 
  withErrorHandler, 
  NotFoundError, 
  ValidationError,
  parsePagination 
} from '@/lib/errors'

/**
 * GET /api/companies
 * Get all companies with pagination
 */
export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url)
  const { limit, skip } = parsePagination(url)
  const search = url.searchParams.get('search') || ''

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
          { industry: { contains: search, mode: 'insensitive' as const } }
        ]
      }
    : {}

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      take: limit,
      skip,
      include: {
        _count: {
          select: {
            users: true,
            cases: true,
            documents: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.company.count({ where })
  ])

  return NextResponse.json({
    data: companies,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * POST /api/companies
 * Create a new company
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json()

  // Validate required fields
  if (!body.name || !body.slug) {
    throw new ValidationError('Name and slug are required')
  }

  // Check if company already exists
  const existing = await prisma.company.findFirst({
    where: {
      OR: [
        { slug: body.slug },
        { name: body.name }
      ]
    }
  })

  if (existing) {
    throw new ValidationError('Company with this name or slug already exists')
  }

  const company = await prisma.company.create({
    data: {
      name: body.name,
      slug: body.slug,
      domain: body.domain,
      logo: body.logo,
      description: body.description,
      industry: body.industry,
      active: body.active !== undefined ? body.active : true
    }
  })

  return NextResponse.json(company, { status: 201 })
})
