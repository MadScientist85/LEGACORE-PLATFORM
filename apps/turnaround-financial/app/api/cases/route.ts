import { NextResponse } from 'next/server'
import { prisma } from '@/packages/database'
import { withErrorHandler, parsePagination } from '@/lib/errors'

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url)
  const { limit, skip } = parsePagination(url)
  const companySlug = 'turnaround-financial'

  const company = await prisma.company.findUnique({ where: { slug: companySlug } })
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where: { companyId: company.id },
      take: limit,
      skip,
      include: { assignedTo: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.case.count({ where: { companyId: company.id } })
  ])

  return NextResponse.json({ data: cases, pagination: { total, page: Math.floor(skip / limit) + 1, limit, pages: Math.ceil(total / limit) } })
})
