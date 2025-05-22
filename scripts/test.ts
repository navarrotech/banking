
import { getPlaidClient } from '../lib/plaid'
import moment from 'moment'

const plaidClient = getPlaidClient()

const { PLAID_ACCESS_TOKEN } = process.env

if (!PLAID_ACCESS_TOKEN) {
  throw new Error('No access token')
}

async function main() {
  const accountsRequest = await plaidClient.accountsGet({
    access_token: PLAID_ACCESS_TOKEN!
  })

  const accounts = accountsRequest.data.accounts

  console.log({
    accounts
  })

  const transacitonsRequest = await plaidClient.transactionsGet({
    access_token: PLAID_ACCESS_TOKEN!,
    start_date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    end_date: moment().format('YYYY-MM-DD')
  })

  const transactions = transacitonsRequest.data.transactions

  console.log({
    transactions
  })
}

main()
