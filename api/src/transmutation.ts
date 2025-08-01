
import type { account, transaction } from '@prisma/client'
import type { Transaction, AccountBase } from 'plaid'

import moment from 'moment'

export function transmuteTransaction(
  transaction: Transaction,
): transaction {
  const authorizedDate = transaction.authorized_datetime ?? transaction.authorized_date
  const date = transaction.datetime ?? transaction.date

  const location = transaction.location?.address
    ? `${transaction.location.address}, ${transaction.location.city}, ${transaction.location.region} ${transaction.location.postal_code}`
    : 'Unknown location'

  return {
    id: transaction.transaction_id,
    name: transaction.name,
    preferred_name: transaction.name,
    account_id: transaction.account_id,
    owner: transaction.account_owner,
    amount: transaction.amount,
    authorized_date: authorizedDate
      ? moment(authorizedDate).toDate()
      : null,
    check_number: transaction.check_number,
    date: date
      ? moment(date).toDate()
      : null,
    currency_code: transaction.iso_currency_code,
    location,
    logo_url: transaction.logo_url,
    merchant_entity_id: transaction.merchant_entity_id,
    merchant_name: transaction.merchant_name,
    payment_channel: transaction.payment_channel,
    transaction_code: transaction.transaction_code,
    website: transaction.website,
    hidden: false,
    notes: '',
  }
}

export function transmuteAccount(
  account: AccountBase,
): account {
  return {
    id: account.account_id,
    name: account.name,
    preferred_name: account.name,
    official_name: account.official_name ?? '',
    mask: account.mask ?? '',
    subtype: account.subtype,
    type: account.type,
    hidden: false,
    notes: '',
    sort: 0,
  }
}
