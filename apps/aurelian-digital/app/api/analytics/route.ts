import { NextResponse } from 'next/server'
import { prisma } from '@/packages/database'
import { withErrorHandler, NotFoundError, parsePagination } from '@/lib/errors'

/**
 * GET /api/analytics
 * Get analytics data for Aurelian Digital
 */
export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url)
  const { limit, skip } = parsePagination(url)
  const period = url.searchParams.get('period')
  const metricName = url.searchParams.get('metric')
  const companySlug = 'aurelian-digital'

  const company = await prisma.company.findUnique({ where: { slug: companySlug } })
  if (!company) throw new NotFoundError('Company')

  const where: any = { companyId: company.id }
  if (period) where.period = period
  if (metricName) where.metricName = metricName

  const [analytics, total] = await Promise.all([
    prisma.analytics.findMany({
      where,
      take: limit,
      skip,
      orderBy: { recordedAt: 'desc' }
    }),
    prisma.analytics.count({ where })
  ])

  // Aggregate metrics by name
  const aggregated = analytics.reduce((acc: any, metric) => {
    if (!acc[metric.metricName]) {
      acc[metric.metricName] = {
        name: metric.metricName,
        values: [],
        total: 0,
        avg: 0
      }
    }
    const value = parseFloat(metric.metricValue.toString())
    acc[metric.metricName].values.push({ period: metric.period, value })
    acc[metric.metricName].total += value
    return acc
  }, {})

  Object.keys(aggregated).forEach(key => {
    const metric = aggregated[key]
    metric.avg = metric.total / metric.values.length
  })

  return NextResponse.json({
    data: analytics,
    aggregated: Object.values(aggregated),
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * POST /api/analytics
 * Record new analytics data
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json()
  const companySlug = 'aurelian-digital'

  const company = await prisma.company.findUnique({ where: { slug: companySlug } })
  if (!company) throw new NotFoundError('Company')

  const analytics = await prisma.analytics.create({
    data: {
      metricName: body.metricName,
      metricValue: body.metricValue,
      period: body.period || new Date().toISOString().substring(0, 7), // YYYY-MM
      companyId: company.id,
      metadata: body.metadata || {}
    }
  })

  return NextResponse.json(analytics, { status: 201 })
})
