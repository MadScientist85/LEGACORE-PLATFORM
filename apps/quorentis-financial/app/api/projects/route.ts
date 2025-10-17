import { NextResponse } from 'next/server'
import { prisma } from '@/packages/database'
import { withErrorHandler, NotFoundError, ValidationError, parsePagination } from '@/lib/errors'

/**
 * GET /api/projects
 * Get all projects for Quorentis Financial
 */
export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url)
  const { limit, skip } = parsePagination(url)
  const status = url.searchParams.get('status')
  const companySlug = 'quorentis-financial'

  const company = await prisma.company.findUnique({ where: { slug: companySlug } })
  if (!company) throw new NotFoundError('Company')

  const where: any = { companyId: company.id }
  if (status) where.status = status

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.project.count({ where })
  ])

  return NextResponse.json({
    data: projects,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * POST /api/projects
 * Create a new project
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json()
  const companySlug = 'quorentis-financial'

  const company = await prisma.company.findUnique({ where: { slug: companySlug } })
  if (!company) throw new NotFoundError('Company')

  if (!body.name) throw new ValidationError('Project name is required')

  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      status: body.status || 'active',
      budget: body.budget,
      currency: body.currency || 'USD',
      companyId: company.id,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      metadata: body.metadata || {}
    }
  })

  return NextResponse.json(project, { status: 201 })
})
