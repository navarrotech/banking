// Copyright © 2024 Navarrotech

// Express core
import express, { type Request, type Response } from "express"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import cors from "cors"

// Routes
import routes from "./src/routes"

// Data
import { initDatabase, closeDatabase } from "./src/lib/database"
import scanLocalFiles from "./src/scanLocalFiles"
import reapplyTags from "@/reapplyTags"

// Environment
import { NODE_ENV, PORT, SECURITY_AUTH_TOKEN } from "@/env"

const time = new Date().toISOString()

const app = express()

const initialization = Promise.all([
  initDatabase(),
])

const close = () => Promise.all([
  closeDatabase(),
])

if (NODE_ENV === "development") {
  app.use("*", cors({
    origin: true,
    credentials: true,
  }))
}

// Trust the proxy
app.set("trust proxy", 1)

app.use(
  cookieParser(),
  helmet({
    contentSecurityPolicy: false,
  }),
  // Rate limiter:
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1 * 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes) (66 requests per minute)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  }),
  express.json(),
  function authMiddleware(request, response, next) {
  if (request.headers.authorization !== `Bearer ${SECURITY_AUTH_TOKEN}`) {
    response.status(401).send()
  }
  else {
    next()
  }
})

async function gracefulShutdown(){
  console.log('Shutting down')
  await close()
  process.exit(0)
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('uncaughtException', async function (err: any) {
  console.log('Crashed', err)
  await gracefulShutdown()
  process.exit(0)
})

// Routes
routes.forEach((func) => {
  const { handler, method="post", path } = func
  app[method](path, async (request: Request, response: Response) => {
    try {
      handler(request, response)
    }
    catch (err: any) {
      console.error("Caught error in routing middleware: ", err)
      if(!response.headersSent) {
        response.status(500)
        response.json({
          message: "Internal Server Error",
        })
      }
    }
  })
})

app.all("/ping", (req, res) => res.status(200).send("pong"))

// 404 - Return a 404 for everything else
app.all("*", (request: any, response: any) =>
  response.status(404).send({
    code: 404,
    message: "Route not found",
  })
)

initialization
  .then(() => {
    console.log('Initialization complete')
    return scanLocalFiles()
  })
  .then(() => reapplyTags())
  .then(() => {
    const end = new Date().toISOString()
    console.log(`Startup completed, took ${new Date(end).getTime() - new Date(time).getTime()}ms`)

    app.listen(PORT, () => console.log(`
      API Startup Complete
        > Port: ${PORT}
        > Version: '--'
        > Environment: ${NODE_ENV}
        > Created by Navarrotech 2024
    `.trim().replaceAll(/^\s*\>/gmi, '  >')))
  })
