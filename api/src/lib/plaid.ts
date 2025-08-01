
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid'

import { IS_SANDBOX } from './env'

const { PLAID_CLIENT_ID, PLAID_SECRET } = process.env
if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.error('Error: set PLAID_CLIENT_ID and PLAID_SECRET in .env')
  process.exit(1)
}

export const accessTokens = [
  { name: 'American Express', token: process.env.PLAID_AMEX_ACCESS_TOKEN! },
  { name: 'ICCU', token: process.env.PLAID_ICCU_ACCESS_TOKEN! }
] as const

const config = new Configuration({
  basePath: IS_SANDBOX ? PlaidEnvironments.Sandbox : PlaidEnvironments.Production,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET
    }
  }
})

export const plaid = new PlaidApi(config)
