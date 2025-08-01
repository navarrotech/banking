
export const {
  DATABASE_URL,
  ACCESS_PASSWORD,

  PLAID_CLIENT_ID,
  PLAID_SECRET,

  PLAID_AMEX_ACCESS_TOKEN,
  PLAID_ICCU_ACCESS_TOKEN,

  DOMAIN = 'http://localhost:3000',
  NODE_ENV = 'development',
  PORT = 3000,
} = process.env

export const IS_SANDBOX = NODE_ENV === 'development'