// Copyright © 2024 Navarrotech

import type { transaction, auto_tag_rule, tags } from "@prisma/client"
import database from "./lib/database"

/*
 * This should re-evaluate all transactions, see if they qualify for any tags
 */

const takeEachCycle = 10_000

let isWorking = false
export default async function reapplyTags(): Promise<boolean> {
  if (isWorking) {
    return false
  }
  isWorking = true

  const startTime = Date.now()

  await database.tags.deleteMany({
    where: {
      auto_assigned: true
    }
  })

  const rules = await database.auto_tag_rule.findMany()

  function checkTransactionRules(transaction: transaction): auto_tag_rule[] {
    let rulesMatched: auto_tag_rule[] = []
    for (const rule of rules) {
      let { description, amount } = transaction
      let { value } = rule

      description = description.trim().toLowerCase()
      value = value.trim().toLowerCase()

      let numberValue = parseFloat(value)
      let isNumber = !isNaN(numberValue)

      let match = false
      switch (rule.condition) {
        case "CONTAINS":
          match = description.includes(value)
          break
        case "STARTS_WITH":
          match = description.startsWith(value)
          break
        case "ENDS_WITH":
          match = description.endsWith(value)
          break
        case "IS":
          if (isNumber) {
            match = amount === numberValue
          }
          else {
            match = description === value
          }
          break
        case "IS_NOT":
          if (isNumber) {
            match = amount !== numberValue
          }
          else {
            match = description !== value
          }
          break
        case "GREATER_THAN":
          match = amount > parseFloat(value)
          break
        case "LESS_THAN":
          match = amount < parseFloat(value)
          break
        case "GREATER_THAN_OR_EQUAL":
          match = amount >= parseFloat(value)
          break
        case "LESS_THAN_OR_EQUAL":
          match = amount <= parseFloat(value)
          break
        case "REGEX":
          match = new RegExp(value).test(description)
          break
      }

      if (match) {
        rulesMatched.push(rule)
      }
    }
    return rulesMatched
  }

  async function recursiveCheck(skip: number) {
    const transactions = await database.transaction.findMany({
      skip,
      take: takeEachCycle,
      orderBy: {
        posted_date: "asc"
      },
      include: {
        tags: true
      }
    })

    if (transactions.length === 0) {
      return
    }

    for (const transaction of transactions) {
      const rulesMatched = checkTransactionRules(transaction)

      if (rulesMatched.length === 0) {
        continue
      }
  
      let promises: Promise<any>[] = []
      for (const rule of rulesMatched) {
        if (transaction.tags.find(tag => tag.inventory_id === rule.inventory_id)) {
          continue
        }

        const newTag = database.tags.create({
          data: {
            inventory_id: rule.inventory_id,
            transaction_id: transaction.id,
            auto_assigned: true
          }
        })
        .catch((error) => {
          console.error(error, rule, transaction)
        })

        // @ts-ignore
        transaction.tags.push({
          inventory_id: rule.inventory_id
        })

        promises.push(newTag)
      }

      await Promise.all(promises)
    }

    await recursiveCheck(skip + takeEachCycle)
  }

  await recursiveCheck(0)
  isWorking = false

  console.log(`Reapplied all tags in ${Date.now() - startTime}ms`)

  return true
}
