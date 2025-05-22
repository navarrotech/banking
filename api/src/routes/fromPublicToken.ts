
import type { Request, Response } from 'express'

import { plaid } from '../lib/plaid'

export async function fromPublicToken(req: Request, res: Response) {
  // We should receive the public_token here as form data
  const publicToken = req.body.public_token
  if (!publicToken) {
    console.log({ body: req.body })
    res.status(400).send('Missing public_token')
    return
  }
  console.log('Received public_token:', publicToken)

  try {
    // exchange the public_token for an access_token
    const exchangeResponse = await plaid.itemPublicTokenExchange({
      public_token: publicToken
    })

    const accessToken: string = exchangeResponse.data.access_token
    console.log('🎉 Login successful, access_token:', accessToken)

    // let the browser know we got it
    res.status(200).send(`Access token: '${accessToken}'`)
  }
  catch (err) {
    console.error('Token exchange error:', err)
    res.status(500).send('Token exchange error')
  }
}
