import { NextResponse } from 'next/server'
import { prisma } from '@/packages/database'
import { 
  withErrorHandler, 
  NotFoundError, 
  ValidationError,
  parsePagination 
} from '@/lib/errors'

/**
 * GET /api/users
 * Get all users with pagination
 */
export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url)
  const { limit, skip } = parsePagination(url)
  const companyId = url.searchParams.get('companyId')
  const role = url.searchParams.get('role')
  const search = url.searchParams.get('search') || ''

  const where: any = {}
  
  if (companyId) {
    where.companyId = companyId
  }
  
  if (role) {
    where.role = role
  }
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' as const } },
      { name: { contains: search, mode: 'insensitive' as const } }
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            cases: true,
            documents: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ])

  // Remove sensitive fields
  const sanitizedUsers = users.map(({ password: _pwd, salt: _salt, ...user }: any) => user)

  return NextResponse.json({
    data: sanitizedUsers,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * POST /api/users
 * Create a new user
 */
export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json()

  // Validate required fields
  if (!body.email || !body.password || !body.companyId) {
    throw new ValidationError('Email, password, and companyId are required')
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: body.email }
  })

  if (existing) {
    throw new ValidationError('User with this email already exists')
  }

  // Verify company exists
  const company = await prisma.company.findUnique({
    where: { id: body.companyId }
  })

  if (!company) {
    throw new NotFoundError('Company')
  }

  // Hash password (simplified - use proper hashing in production)
  const crypto = require('crypto')
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(body.password, salt, 1000, 64, 'sha512').toString('hex')

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hash,
      salt,
      name: body.name,
      role: body.role || 'USER',
      companyId: body.companyId,
      active: body.active !== undefined ? body.active : true
    }
  })

  // Remove sensitive fields
  const { password: _password, salt: _salt, ...sanitizedUser } = user

  return NextResponse.json(sanitizedUser, { status: 201 })
})
