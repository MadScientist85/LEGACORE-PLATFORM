import { NextResponse } from 'next/server'
import { prisma } from '@/packages/database'
import { 
  withErrorHandler, 
  NotFoundError, 
  ValidationError,
  parsePagination 
} from '@/lib/errors'

/**
 * GET /api/cases
 * Get all cases for asset recovery
 */
export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url)
  const { limit, skip } = parsePagination(url)
  const status = url.searchParams.get('status')
  const companySlug = 'hbu-asset-recovery'

  // Get company ID
  const company = await prisma.company.findUnique({
    where: { slug: companySlug }
  })

  if (!company) {
    throw new NotFoundError('Company')
  }

  const where: any = { companyId: company.id }
  
  if (status) {
    where.status = status
  }

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      take: limit,
      skip,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.case.count({ where })
  ])

  return NextResponse.json({
    data: cases,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * POST /api/cases
 * Create a new case
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json()
  const companySlug = 'hbu-asset-recovery'

  // Get company
  const company = await prisma.company.findUnique({
    where: { slug: companySlug }
  })

  if (!company) {
    throw new NotFoundError('Company')
  }

  // Validate required fields
  if (!body.title) {
    throw new ValidationError('Title is required')
  }

  // Generate case number
  const caseNumber = `HBU-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  const newCase = await prisma.case.create({
    data: {
      caseNumber,
      title: body.title,
      description: body.description,
      status: body.status || 'OPEN',
      priority: body.priority || 3,
      amount: body.amount,
      currency: body.currency || 'USD',
      companyId: company.id,
      assignedToId: body.assignedToId,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return NextResponse.json(newCase, { status: 201 })
})
