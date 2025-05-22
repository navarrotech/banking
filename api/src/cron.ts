
import { prisma } from './lib/database'
import { transmuteAccount, transmuteTransaction } from './transmutation'

import { plaid, accessTokens } from './lib/plaid'
import { CronJob } from 'cron'

import moment from 'moment'
import fs from 'fs'

const latestAccountsLog = '/app/logs/accounts.log'
const latestTransactionsLog = '/app/logs/transactions.log'

// This should run every morning at 00 MST
CronJob.from({
  cronTime: '0 0 * * *',
  onTick: async function everyMorning() {
    for (const accessToken of accessTokens) {
      const startDate = moment().subtract(1, 'year').format('YYYY-MM-DD')
      const endDate = moment().format('YYYY-MM-DD')

      try {
        const [accountsRequest, transactionsRequest] = await Promise.all([
          plaid.accountsGet({
            access_token: accessToken
          }),
          plaid.transactionsGet({
            access_token: accessToken,
            start_date: startDate,
            end_date: endDate
          })
        ])

        const transactions = transactionsRequest.data.transactions
        const accounts = accountsRequest.data.accounts

        fs.writeFileSync(
          latestAccountsLog,
          JSON.stringify(accountsRequest.data, null, 2),
          { flag: 'w' }
        )

        fs.writeFileSync(
          latestTransactionsLog,
          JSON.stringify(transactionsRequest.data, null, 2),
          { flag: 'w' }
        )

        console.log('[CRON] Accounts and transactions fetched successfully')

        const addAccounts = await prisma.account.createMany({
          data: accounts.map(transmuteAccount),
          skipDuplicates: true
        })

        const addTransactions = await prisma.transaction.createMany({
          data: transactions.map(transmuteTransaction),
          skipDuplicates: true
        })

        console.log('[CRON] Accounts and transactions saved to database')

        prisma.plaid_logs.create({
          data: {
            accounts_fetched: accounts.length,
            transactions_fetched: transactions.length,
            transactions_added: addTransactions.count,
          }
        })
      }
      catch (error) {
        console.error('[CRON] Error fetching transactions:', error)
        prisma.plaid_logs.create({
          data: {
            error: JSON.stringify(error),
          }
        })
      }
    }
  },
  start: true,
  timeZone: 'America/Denver',
})

console.log('Cron jobs registered')
