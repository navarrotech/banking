import express from 'express'
import https from 'https'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import type { ServerOptions } from 'https'

import fs from 'fs'

const app = express()

app.use(
  // Rate limiter:
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1 * 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes) (66 requests per minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  }),
)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}))

app.all('/ping', (request, response) => {
  response.status(200).send('pong')
})

const sslOptions: ServerOptions = {
  key: fs.readFileSync('localhost-key.pem'),
  cert: fs.readFileSync('localhost.pem')
}

const makeServer = (app: express.Express) => {
  return https.createServer(
    sslOptions,
    app
  )
}

export { makeServer, app }
