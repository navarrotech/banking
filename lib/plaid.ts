import dotenv from 'dotenv'
dotenv.config()

import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid'

const { PLAID_CLIENT_ID, PLAID_SECRET } = process.env
if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.error('Error: set PLAID_CLIENT_ID and PLAID_SECRET in .env')
  process.exit(1)
}

export function getPlaidClient(sandbox: boolean = true) {
  const config = new Configuration({
    basePath: sandbox ? PlaidEnvironments.Sandbox : PlaidEnvironments.Production,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET
      }
    }
  })

  return new PlaidApi(config)
}
