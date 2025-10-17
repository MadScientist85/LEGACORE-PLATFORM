import { NextResponse } from 'next/server'
import { prisma } from '@/packages/database'
import { withErrorHandler, parsePagination } from '@/lib/errors'
import { AIUtils } from '@/packages/ai'

/**
 * GET /api/opportunities
 * Get government contracting opportunities with AI scoring
 */
export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url)
  const { limit, skip } = parsePagination(url)
  const agency = url.searchParams.get('agency')
  const minScore = url.searchParams.get('minScore')
  const search = url.searchParams.get('search')

  const where: any = {}
  
  if (agency) {
    where.agency = { contains: agency, mode: 'insensitive' as const }
  }
  
  if (minScore) {
    where.aiScore = { gte: parseFloat(minScore) }
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } },
      { agency: { contains: search, mode: 'insensitive' as const } }
    ]
  }

  const [opportunities, total] = await Promise.all([
    prisma.contractOpportunity.findMany({
      where,
      take: limit,
      skip,
      orderBy: [
        { aiScore: 'desc' },
        { responseDeadline: 'asc' }
      ]
    }),
    prisma.contractOpportunity.count({ where })
  ])

  return NextResponse.json({
    data: opportunities,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * POST /api/opportunities
 * Create a new opportunity (for demo/testing)
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json()

  // Generate AI score based on description
  const keywords = ['AI', 'ML', 'cloud', 'cybersecurity', 'data', 'analytics']
  const aiScore = AIUtils.scoreRelevance(body.description || '', keywords)
  
  // Generate AI summary
  const aiSummary = await AIUtils.summarize(body.description || '', 200)

  const opportunity = await prisma.contractOpportunity.create({
    data: {
      solicitation: body.solicitation,
      title: body.title,
      agency: body.agency,
      description: body.description,
      postedDate: new Date(body.postedDate),
      responseDeadline: new Date(body.responseDeadline),
      setValue: body.setValue,
      placeOfPerformance: body.placeOfPerformance,
      naicsCode: body.naicsCode,
      pscCode: body.pscCode,
      contactInfo: body.contactInfo,
      url: body.url,
      aiScore,
      aiSummary,
      metadata: body.metadata || {}
    }
  })

  return NextResponse.json(opportunity, { status: 201 })
})
