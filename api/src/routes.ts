
import { prisma } from './lib/database'
import type { Express } from "express"

// Routes
import multer from 'multer'
import { getAccessTokenRoute } from './routes/getAccessTokenRoute'
import { plaidLinkCallback } from './routes/plaidLinkCallback'
import { fromPublicToken } from './routes/fromPublicToken'

const upload = multer()

export function makeRoutes(app: Express) {
  app.get('/', async function getRootRoute(request, response) {
    const start_date = request.query.start_date
    const end_date = request.query.end_date

    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc'
      },
      where: {
        date: {
          gte: start_date ? new Date(start_date as string) : undefined,
          lte: end_date ? new Date(end_date as string) : undefined
        }
      }
    })

    const accounts = await prisma.account.findMany({
      orderBy: {
        sort: 'desc'
      },
    })

    response.json({
      accounts,
      transactions
    })
  })

  app.get('/access-token', getAccessTokenRoute)
  app.get('/plaid-link-callback', plaidLinkCallback)
  app.post('/from-public-token', upload.none(), fromPublicToken)

  return app
}
