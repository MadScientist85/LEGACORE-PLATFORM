import { PrismaClient, UserRole, CaseStatus, DocumentType, CreditTransactionType } from './generated/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

// Custom error classes
class SeedError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message)
    this.name = 'SeedError'
  }
}

class ValidationError extends SeedError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Utility functions
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { hash, salt }
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60))
  console.log(`  ${title}`)
  console.log('='.repeat(60))
}

function logSuccess(message: string) {
  console.log(`✓ ${message}`)
}

function logError(message: string, error?: Error) {
  console.error(`✗ ${message}`)
  if (error) {
    console.error(`  Error: ${error.message}`)
    if (error.stack && process.env.DEBUG) {
      console.error(`  Stack: ${error.stack}`)
    }
  }
}

function logWarning(message: string) {
  console.warn(`⚠ ${message}`)
}

// Seed functions
async function seedCompanies() {
  logSection('Seeding Companies')
  
  const companies = [
    {
      name: 'HBU Asset Recovery',
      slug: 'hbu-asset-recovery',
      domain: 'hbu.legacore.com',
      description: 'Professional asset recovery and debt collection services',
      industry: 'Financial Services'
    },
    {
      name: 'Vivat Legacy',
      slug: 'vivat-legacy',
      domain: 'vivat.legacore.com',
      description: 'Estate planning and legacy management solutions',
      industry: 'Legal Services'
    },
    {
      name: 'Turnaround Financial',
      slug: 'turnaround-financial',
      domain: 'turnaround.legacore.com',
      description: 'Business turnaround and financial restructuring',
      industry: 'Financial Services'
    },
    {
      name: 'Quorentis Financial',
      slug: 'quorentis-financial',
      domain: 'quorentis.legacore.com',
      description: 'Corporate finance and investment advisory',
      industry: 'Financial Services'
    },
    {
      name: 'Aurelian Digital',
      slug: 'aurelian-digital',
      domain: 'aurelian.legacore.com',
      description: 'Digital transformation and technology consulting',
      industry: 'Technology'
    },
    {
      name: 'Lumora Creations',
      slug: 'lumora-creations',
      domain: 'lumora.legacore.com',
      description: 'Creative agency and digital content production',
      industry: 'Creative Services'
    },
    {
      name: 'GrokCon Agent',
      slug: 'grokcon-agent',
      domain: 'grokcon.legacore.com',
      description: 'AI-powered government contracting opportunities platform',
      industry: 'Government Contracting'
    },
    {
      name: 'Admin Portal',
      slug: 'admin-portal',
      domain: 'admin.legacore.com',
      description: 'Central administration and management portal',
      industry: 'Platform Management'
    }
  ]

  const createdCompanies = []
  
  for (const companyData of companies) {
    try {
      const company = await prisma.company.upsert({
        where: { slug: companyData.slug },
        update: companyData,
        create: companyData
      })
      createdCompanies.push(company)
      logSuccess(`Created/Updated company: ${company.name}`)
    } catch (error) {
      logError(`Failed to create company: ${companyData.name}`, error as Error)
      throw new SeedError(`Company seeding failed for ${companyData.name}`, error as Error)
    }
  }

  return createdCompanies
}

async function seedUsers(companies: any[]) {
  logSection('Seeding Users')
  
  const users = []
  
  for (const company of companies) {
    try {
      // Admin user for each company
      const adminPassword = hashPassword('Admin123!')
      const admin = await prisma.user.upsert({
        where: { email: `admin@${company.slug}.com` },
        update: {},
        create: {
          email: `admin@${company.slug}.com`,
          password: adminPassword.hash,
          salt: adminPassword.salt,
          name: `${company.name} Admin`,
          role: UserRole.ADMIN,
          companyId: company.id
        }
      })
      users.push(admin)
      logSuccess(`Created admin user for ${company.name}: ${admin.email}`)

      // Manager user
      const managerPassword = hashPassword('Manager123!')
      const manager = await prisma.user.upsert({
        where: { email: `manager@${company.slug}.com` },
        update: {},
        create: {
          email: `manager@${company.slug}.com`,
          password: managerPassword.hash,
          salt: managerPassword.salt,
          name: `${company.name} Manager`,
          role: UserRole.MANAGER,
          companyId: company.id
        }
      })
      users.push(manager)
      logSuccess(`Created manager user for ${company.name}: ${manager.email}`)

      // Regular user
      const userPassword = hashPassword('User123!')
      const user = await prisma.user.upsert({
        where: { email: `user@${company.slug}.com` },
        update: {},
        create: {
          email: `user@${company.slug}.com`,
          password: userPassword.hash,
          salt: userPassword.salt,
          name: `${company.name} User`,
          role: UserRole.USER,
          companyId: company.id
        }
      })
      users.push(user)
      logSuccess(`Created regular user for ${company.name}: ${user.email}`)
    } catch (error) {
      logError(`Failed to create users for company: ${company.name}`, error as Error)
      throw new SeedError(`User seeding failed for ${company.name}`, error as Error)
    }
  }

  return users
}

async function seedCases(companies: any[], users: any[]) {
  logSection('Seeding Cases')
  
  const cases = []
  const caseStatuses = Object.values(CaseStatus)
  
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i]
    const companyUsers = users.filter(u => u.companyId === company.id)
    
    if (companyUsers.length === 0) continue
    
    for (let j = 0; j < 5; j++) {
      try {
        const caseNumber = `${company.slug.substring(0, 3).toUpperCase()}-${Date.now()}-${j}`
        const randomUser = companyUsers[Math.floor(Math.random() * companyUsers.length)]
        const status = caseStatuses[Math.floor(Math.random() * caseStatuses.length)]
        
        const caseData = await prisma.case.create({
          data: {
            caseNumber,
            title: `${company.name} Case ${j + 1}`,
            description: `Demo case for ${company.name} - Case ${j + 1}`,
            status,
            priority: Math.floor(Math.random() * 5) + 1,
            amount: (Math.random() * 100000).toFixed(2),
            currency: 'USD',
            companyId: company.id,
            assignedToId: randomUser.id,
            dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000)
          }
        })
        cases.push(caseData)
      } catch (error) {
        logWarning(`Failed to create case ${j + 1} for ${company.name}`)
      }
    }
    logSuccess(`Created 5 cases for ${company.name}`)
  }

  return cases
}

async function seedDocuments(companies: any[], users: any[], cases: any[]) {
  logSection('Seeding Documents')
  
  const documents = []
  const documentTypes = Object.values(DocumentType)
  
  for (const company of companies) {
    const companyUsers = users.filter(u => u.companyId === company.id)
    const companyCases = cases.filter(c => c.companyId === company.id)
    
    if (companyUsers.length === 0) continue
    
    for (let i = 0; i < 10; i++) {
      try {
        const randomUser = companyUsers[Math.floor(Math.random() * companyUsers.length)]
        const randomCase = companyCases.length > 0 ? companyCases[Math.floor(Math.random() * companyCases.length)] : null
        const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)]
        
        const document = await prisma.document.create({
          data: {
            title: `${docType} Document ${i + 1}`,
            description: `Demo ${docType.toLowerCase()} document for ${company.name}`,
            type: docType,
            filename: `doc-${i + 1}.pdf`,
            filepath: `/uploads/${company.slug}/doc-${i + 1}.pdf`,
            filesize: Math.floor(Math.random() * 5000000),
            mimeType: 'application/pdf',
            url: `https://storage.legacore.com/${company.slug}/doc-${i + 1}.pdf`,
            companyId: company.id,
            uploadedById: randomUser.id,
            caseId: randomCase?.id
          }
        })
        documents.push(document)
      } catch (error) {
        logWarning(`Failed to create document ${i + 1} for ${company.name}`)
      }
    }
    logSuccess(`Created 10 documents for ${company.name}`)
  }

  return documents
}

async function seedCredits(companies: any[], users: any[]) {
  logSection('Seeding Credits')
  
  for (const company of companies) {
    try {
      const companyUsers = users.filter(u => u.companyId === company.id)
      
      if (companyUsers.length === 0) continue
      
      const initialBalance = 10000
      const credit = await prisma.credit.create({
        data: {
          balance: initialBalance,
          totalPurchased: initialBalance,
          totalUsed: 0,
          companyId: company.id
        }
      })

      // Create initial purchase transaction
      const adminUser = companyUsers.find(u => u.role === UserRole.ADMIN)
      if (adminUser) {
        await prisma.creditTransaction.create({
          data: {
            type: CreditTransactionType.PURCHASE,
            amount: initialBalance,
            description: 'Initial credit allocation',
            creditId: credit.id,
            userId: adminUser.id
          }
        })
      }

      logSuccess(`Created credit account for ${company.name} with ${initialBalance} credits`)
    } catch (error) {
      logError(`Failed to create credits for ${company.name}`, error as Error)
      throw new SeedError(`Credit seeding failed for ${company.name}`, error as Error)
    }
  }
}

async function seedProjects(companies: any[]) {
  logSection('Seeding Projects')
  
  const projectCompanies = companies.filter(c => 
    ['quorentis-financial', 'aurelian-digital', 'lumora-creations'].includes(c.slug)
  )
  
  for (const company of projectCompanies) {
    try {
      for (let i = 0; i < 3; i++) {
        await prisma.project.create({
          data: {
            name: `${company.name} Project ${i + 1}`,
            description: `Demo project for ${company.name}`,
            status: i === 0 ? 'active' : i === 1 ? 'planning' : 'completed',
            budget: (Math.random() * 500000).toFixed(2),
            currency: 'USD',
            companyId: company.id,
            metadata: {
              phase: i === 0 ? 'execution' : i === 1 ? 'planning' : 'closed',
              team_size: Math.floor(Math.random() * 10) + 1,
              tags: ['demo', 'sample', company.slug]
            }
          }
        })
      }
      logSuccess(`Created 3 projects for ${company.name}`)
    } catch (error) {
      logError(`Failed to create projects for ${company.name}`, error as Error)
    }
  }
}

async function seedAnalytics(companies: any[]) {
  logSection('Seeding Analytics')
  
  const analyticsCompanies = companies.filter(c => 
    ['aurelian-digital', 'turnaround-financial', 'admin-portal'].includes(c.slug)
  )
  
  const metrics = [
    'revenue',
    'active_users',
    'conversion_rate',
    'customer_satisfaction',
    'project_completion_rate'
  ]
  
  const periods = ['2024-01', '2024-02', '2024-03', '2024-Q1']
  
  for (const company of analyticsCompanies) {
    try {
      for (const metric of metrics) {
        for (const period of periods) {
          await prisma.analytics.create({
            data: {
              metricName: metric,
              metricValue: (Math.random() * 1000).toFixed(2),
              period,
              companyId: company.id,
              metadata: {
                unit: metric === 'revenue' ? 'USD' : metric.includes('rate') ? 'percentage' : 'count',
                source: 'demo_data'
              }
            }
          })
        }
      }
      logSuccess(`Created analytics data for ${company.name}`)
    } catch (error) {
      logError(`Failed to create analytics for ${company.name}`, error as Error)
    }
  }
}

async function seedContractOpportunities() {
  logSection('Seeding Contract Opportunities (GrokCon)')
  
  const opportunities = [
    {
      solicitation: 'W911QY24R0001',
      title: 'IT Infrastructure Modernization Services',
      agency: 'Department of Defense - Army',
      description: 'Comprehensive IT infrastructure modernization including cloud migration, cybersecurity enhancements, and legacy system upgrades.',
      postedDate: new Date('2024-01-15'),
      responseDeadline: new Date('2024-03-15'),
      setValue: 5000000,
      placeOfPerformance: 'Fort Belvoir, VA',
      naicsCode: '541512',
      pscCode: 'D302',
      contactInfo: 'contracting.officer@army.mil',
      url: 'https://sam.gov/opp/W911QY24R0001',
      aiScore: 87.5,
      aiSummary: 'High-value opportunity for IT modernization with strong alignment to cloud and cybersecurity capabilities.'
    },
    {
      solicitation: 'NASA24-001',
      title: 'Data Analytics and AI Platform Development',
      agency: 'National Aeronautics and Space Administration',
      description: 'Development of advanced data analytics platform with AI/ML capabilities for mission critical data processing.',
      postedDate: new Date('2024-02-01'),
      responseDeadline: new Date('2024-04-01'),
      setValue: 12000000,
      placeOfPerformance: 'Various NASA Centers',
      naicsCode: '541511',
      pscCode: 'D307',
      contactInfo: 'nasa.procurement@nasa.gov',
      url: 'https://sam.gov/opp/NASA24-001',
      aiScore: 92.3,
      aiSummary: 'Excellent opportunity for AI/ML capabilities with long-term partnership potential.'
    },
    {
      solicitation: 'GSA-23-R-0045',
      title: 'Cloud Services and Support',
      agency: 'General Services Administration',
      description: 'Provision of cloud computing services including IaaS, PaaS, and SaaS solutions.',
      postedDate: new Date('2024-01-20'),
      responseDeadline: new Date('2024-03-20'),
      setValue: 8000000,
      placeOfPerformance: 'Washington, DC',
      naicsCode: '518210',
      pscCode: 'D308',
      contactInfo: 'gsa.contracts@gsa.gov',
      url: 'https://sam.gov/opp/GSA-23-R-0045',
      aiScore: 78.6,
      aiSummary: 'Standard cloud services opportunity with moderate competition expected.'
    },
    {
      solicitation: 'DHS-24-CYBER-001',
      title: 'Cybersecurity Operations and Incident Response',
      agency: 'Department of Homeland Security',
      description: '24/7 cybersecurity operations center services and incident response capabilities.',
      postedDate: new Date('2024-02-10'),
      responseDeadline: new Date('2024-04-10'),
      setValue: 15000000,
      placeOfPerformance: 'Multiple Locations',
      naicsCode: '541512',
      pscCode: 'R499',
      contactInfo: 'dhs.cyber@dhs.gov',
      url: 'https://sam.gov/opp/DHS-24-CYBER-001',
      aiScore: 95.2,
      aiSummary: 'Critical cybersecurity opportunity with high priority status and excellent fit.'
    },
    {
      solicitation: 'DOE-2024-5678',
      title: 'Energy Management Systems Integration',
      agency: 'Department of Energy',
      description: 'Integration of energy management systems across multiple facilities with IoT and analytics.',
      postedDate: new Date('2024-01-25'),
      responseDeadline: new Date('2024-03-25'),
      setValue: 6000000,
      placeOfPerformance: 'Oak Ridge, TN',
      naicsCode: '541330',
      pscCode: 'J043',
      contactInfo: 'doe.contracts@energy.gov',
      url: 'https://sam.gov/opp/DOE-2024-5678',
      aiScore: 81.4,
      aiSummary: 'Specialized opportunity requiring energy sector expertise and IoT capabilities.'
    }
  ]

  for (const opp of opportunities) {
    try {
      await prisma.contractOpportunity.upsert({
        where: { solicitation: opp.solicitation },
        update: opp,
        create: opp
      })
      logSuccess(`Created contract opportunity: ${opp.solicitation}`)
    } catch (error) {
      logError(`Failed to create opportunity: ${opp.solicitation}`, error as Error)
    }
  }
}

// Main seed function
async function main() {
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║           LEGACORE PLATFORM DATABASE SEEDING               ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('\n')

  try {
    // Check database connection
    logSection('Database Connection Check')
    await prisma.$connect()
    logSuccess('Successfully connected to database')

    // Seed data in order
    const companies = await seedCompanies()
    const users = await seedUsers(companies)
    const cases = await seedCases(companies, users)
    const documents = await seedDocuments(companies, users, cases)
    await seedCredits(companies, users)
    await seedProjects(companies)
    await seedAnalytics(companies)
    await seedContractOpportunities()

    // Summary
    logSection('Seeding Summary')
    const counts = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.case.count(),
      prisma.document.count(),
      prisma.credit.count(),
      prisma.project.count(),
      prisma.analytics.count(),
      prisma.contractOpportunity.count()
    ])

    console.log('\nDatabase has been successfully seeded with:')
    console.log(`  • ${counts[0]} companies`)
    console.log(`  • ${counts[1]} users`)
    console.log(`  • ${counts[2]} cases`)
    console.log(`  • ${counts[3]} documents`)
    console.log(`  • ${counts[4]} credit accounts`)
    console.log(`  • ${counts[5]} projects`)
    console.log(`  • ${counts[6]} analytics records`)
    console.log(`  • ${counts[7]} contract opportunities`)
    
    console.log('\n✓ Seeding completed successfully!\n')
    process.exit(0)
  } catch (error) {
    console.log('\n')
    logError('Seeding failed with error:', error as Error)
    console.log('\n')
    
    if (error instanceof SeedError) {
      console.error(`Seed Error: ${error.message}`)
      if (error.cause) {
        console.error(`Caused by: ${error.cause.message}`)
      }
    } else {
      console.error(`Unexpected error: ${(error as Error).message}`)
      if ((error as Error).stack && process.env.DEBUG) {
        console.error((error as Error).stack)
      }
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
