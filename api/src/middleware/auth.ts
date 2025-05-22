
import type { Request, Response, NextFunction } from 'express'

import { ACCESS_PASSWORD, NODE_ENV } from '../lib/env'

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  // Pull the Authorization header
  const authHeader = request.headers.authorization
  if (!authHeader) {
    // No creds provided → prompt
    response.set('WWW-Authenticate', 'Basic realm="Restricted Area"')
    response.status(401).send('Authentication required')
    return
  }

  // Format is "Basic base64(username:password)"
  const [scheme, encoded] = authHeader.split(' ')
  if (scheme !== 'Basic' || !encoded) {
    response.set('WWW-Authenticate', 'Basic realm="Restricted Area"')
    response.status(401).send('Invalid authentication header')
    return
  }

  // Decode and split into user/pass
  const buffer = Buffer.from(encoded, 'base64')
  const [username, password] = buffer.toString().split(':')

  // Check credentials however you like
  if (username === 'alex' && password === ACCESS_PASSWORD) {
    return next()
  }

  // Wrong creds → re-prompt
  response.set('WWW-Authenticate', 'Basic realm="Restricted Area"')
  response.status(401).send('Access denied')
}