// Copyright © 2024 Navarrotech

import { useSelector } from "@/store"

import DonutThat from "./DonutThat"
import randomColor from "randomcolor"
import type { Transaction } from "@/types"

export default function SpendingCharts(){
  const transactions = useSelector(state => state.data.transactions)
  const inventoryById = useSelector(state => state.data.tagInventory.byId)
  const inventoryList = useSelector(state => state.data.tagInventory.list)

  const incomeByLabel = {} as Record<string, number>
  const spendingByTags = {} as Record<string, number>

  const unpaidUpcomingBills: Record<string, boolean> = {}
  inventoryList
    .filter(tag => !!tag.amount)
    .forEach(tag => {
      unpaidUpcomingBills[tag.id] = true
    })

  let totalUnknown = 0
  let totalSpend = 0
  let totalIncome = 0
  let totalSmallRecurring = 0

  const income: Transaction[] = []

  transactions.forEach((transaction) => {
    if (transaction.amount >= 0) {
      if (!incomeByLabel[transaction.description]){
        incomeByLabel[transaction.description] = 0
      }
      incomeByLabel[transaction.description] += transaction.amount
      totalIncome += transaction.amount
      income.push(transaction)
      return
    }
    totalSpend += transaction.amount

    if (!transaction.tags?.length) {
      if (transaction.amount < 0) {
        totalUnknown += transaction.amount
      }
      return
    }

    // TODO: This could duplicate math because one transaction could have 2 tags!
    transaction.tags.forEach(tag => {
      const inventory = inventoryById[tag.inventory_id]
      unpaidUpcomingBills[tag.inventory_id] = false
      const key = tag.inventory_id

      if (inventory.frequency !== "NONE" && (inventory?.amount || 0) <= 20){
        totalSmallRecurring += Math.abs(transaction.amount)
        return
      }

      if (!spendingByTags[key]) {
        spendingByTags[key] = 0
      }

      spendingByTags[key] += transaction.amount
    }, {} as Record<string, number>)
  })

  const spendingByTagsData = Object
    .entries(spendingByTags)
    .map(([inventory_key, amount]) => ({
      id: inventory_key,
      label: (inventoryById[inventory_key]?.name || "????") + " (" + (Math.abs(amount) / Math.abs(totalSpend) * 100).toFixed(1) + "%)",
      value: Math.abs(amount),
      color: inventoryById[inventory_key]?.color || randomColor(),
    }))

  if (totalSmallRecurring > 0) {
    spendingByTagsData.push({
      id: "Small Recurring",
      label: "Small Recurring" + " (" + (Math.abs(totalSmallRecurring) / Math.abs(totalSpend) * 100).toFixed(1) + "%)",
      value: Math.abs(totalSmallRecurring),
      color: 'white',
    })
  }

  if (totalUnknown < 0) {
    spendingByTagsData.push({
      id: "Unknown",
      label: "Unknown"  + " (" + (Math.abs(totalUnknown) / Math.abs(totalSpend) * 100).toFixed(1) + "%)",
      value: Math.abs(totalUnknown),
      color: 'grey',
    })
  }

  const unknownPercent = (totalUnknown / totalSpend) * 100

  const incomeByTagsData = Object
    .entries(incomeByLabel)
    .map(([label, amount]) => ({
      id: label,
      label,
      value: amount,
      color: randomColor(),
    }))

  spendingByTagsData.sort((a, b) => b.value - a.value)

  const leftover = totalIncome + totalSpend

  let unpaidUpcomingBillsCount = 0
  const unpaidUpcomingBillsEntires = Object
    .entries(unpaidUpcomingBills)
    .filter(([key, value]) => value)

  unpaidUpcomingBillsEntires
    .forEach(([key, value]) => {
      unpaidUpcomingBillsCount += inventoryById[key].amount || 0
    })

  if (unpaidUpcomingBillsCount < 0) {
    console.error("unpaidUpcomingBillsCount is negative??", unpaidUpcomingBillsCount)
    unpaidUpcomingBillsCount = 0
  }

  // Small offset for mortgage stuff :/
  // TODO: Probably do this better
  const mortgageInventory = inventoryList.find(tag => tag.name.includes("Mortgage"))
  const mortgagePayments = transactions.filter(transaction => transaction.tags?.find(tag => tag.inventory_id === mortgageInventory?.id))
  const remainingMortgagePayments = (mortgageInventory?.amount || 0) + mortgagePayments.reduce((acc, transaction) => acc + transaction.amount, 0)

  if (remainingMortgagePayments > 0) {
    unpaidUpcomingBillsCount += remainingMortgagePayments
  }

  const highestIncome = income.sort((a, b) => b.amount - a.amount)?.[0]?.amount || 0
  const payrollCheck = income
    .findLast(transaction => transaction.description.includes("payroll")) 
    || highestIncome >= 2_500 ? highestIncome : 3310.19

  const paycheckCounts: number = income
    .filter(transaction => transaction.amount >= 2_500)
    .length

  const futureIncomePrediction = paycheckCounts === 0
    ? payrollCheck * 2
    : paycheckCounts === 1
      ? payrollCheck
      : 0

  const grandTotal = leftover - Math.abs(unpaidUpcomingBillsCount) + futureIncomePrediction

  return <>
    <div className="block box">
      <div className="block">
        <h1 className="title is-size-3">Income</h1>
      </div>
      <div className="block">
        <div className="level">
          <span>Income so far</span>
          <span className="has-text-success">{"$" + totalIncome.toFixed(2)}</span>
        </div>
        <div className="level">
          <span>Spend so far</span>
          <span className="has-text-danger">{"$" + totalSpend.toFixed(2)}</span>
        </div>
        <hr style={{ margin: '0.75rem 0 0.2rem 0' }}/>
        <div className="level">
          <strong>After spending</strong>
          <strong className={`has-text-${leftover > 0 ? 'success' : 'danger'}`}>{"$" + leftover.toFixed(2)}</strong>
        </div>
        <div className="level mt-4">
          <strong>Upcoming unpaid bills</strong>
          <strong>${ unpaidUpcomingBillsCount.toFixed(2) }</strong>
        </div>
        <div className="ml-4">
        { remainingMortgagePayments > 0 && <div key='remaining-mortgage' className="level">
            <span>Remaining Mortgage</span>
            <span>$-{ remainingMortgagePayments }</span>
          </div>
        }
        {
          unpaidUpcomingBillsEntires.map(([key, value]) => 
            <div key={key} className="level">
              <span>{ inventoryById[key].name }</span>
              <span>$-{ (inventoryById[key].amount || 0).toFixed(2) }</span>
            </div>
          ) 
        }</div>
        <div className="level">
          <span>Future paycheck</span>
          <strong className="has-text-success">${ futureIncomePrediction.toFixed(2) }</strong>
        </div>
        <hr style={{ margin: '0.75rem 0 0.2rem 0' }}/>
        <div className="level">
          <strong>Grand total estimation</strong>
          <strong className={`has-text-${grandTotal > 0 ? 'success' : 'danger'}`}>{"$" + grandTotal.toFixed(2)}</strong>
        </div>
      </div>
      <div className="block chart is-medium">
        <DonutThat data={incomeByTagsData} isCurrency />
      </div>
    </div>
    <div className="block box">
      <div className="block">
        <h1 className="title is-size-3">Spending by tags</h1>
      </div>
      <div className="block columns">
        
        <div className="column">
          <div className="block">
            <label className="label">Top spending categories</label>
          </div>
          <div className="">{
            spendingByTagsData.slice(0, 10).map((tag) => 
              <div key={tag.id} className="field level">
                <div className="level-left">
                  <div className="color" style={{ backgroundColor: tag.color }} />
                  <p>{ tag.label }</p>
                </div>
                <p>${ tag.value.toFixed(2) }</p>
              </div>
            )  
          }</div>
        </div>
        <div className="column">
          <div className="block chart is-medium">
            <DonutThat data={spendingByTagsData} isCurrency canFullscreen />
          </div>
          {
            unknownPercent > 0 && <p className="has-text-centered has-text-danger" data-tooltip={"$" + totalUnknown.toFixed(2)}>{ unknownPercent.toFixed(1) }% of purchases are unknown</p>
          }
        </div>
        
      </div>
    </div>
  </>
}
