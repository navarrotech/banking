
import { plaid } from '../lib/plaid'
import { Products, CountryCode } from 'plaid'
import { DOMAIN } from '@/lib/env'

import type { Request, Response } from "express"

export async function getAccessTokenRoute(request: Request, response: Response) {
  try {
    const resp = await plaid
      .linkTokenCreate({
        user: { client_user_id: `2086859783` },
        client_name: 'Alex Navarro',
        products: [
          Products.Transactions,
          // Products.Balance,
        ],
        country_codes: [CountryCode.Us],
        language: 'en',
        redirect_uri: `${DOMAIN}/plaid-link-callback`
      })
      .catch((error) => {
        if (error?.response?.data) {
          console.error('Error creating link token:', error.response.data)
        }
        else {
          console.error('Error creating link token:', error)
        }
        process.exit(1)
      })

    const linkToken = resp.data.link_token
    const linkUrl = `https://cdn.plaid.com/link/v2/stable/link.html?token=${linkToken}`

    response.status(200).send(`
      <!doctype html>
      <html>
        <head>
          <title>Redirecting...</title>
          <meta content="utf-8" http-equiv="encoding">
          <meta name="viewport" content="initial-scale=1">
          <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
        </head>
        <body>
          <script>
            localStorage.setItem('plaid-link-token', '${linkToken}')
            window.location.href = '${linkUrl}'
          </script>
        </body>
      </html>
    `)
  }
  catch (err) {
    console.error('Error creating link token:', err)
    process.exit(1)
  }
}
