// Copyright © 2024 Navarrotech

import { useEffect, useState } from "react"
import type { Transaction } from "@/types"
import api from "@/common/axios"
import moment from "moment"
import { useSelector } from "@/store"
import BarChartThat from "@/components/BarChartThat"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons"

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

export default function YearToDate() {
  const [ year, setYear ] = useState<number>(new Date().getFullYear())
  const [ transactions, setTransactions ] = useState<Transaction[]>([])
  const [ expanded, setExpanded ] = useState<string[]>([])
  const tagsInventory = useSelector(state => state.data.tagInventory.byId)

  useEffect(() => {
    const startDate = moment(`${year}-01-01`).startOf('year')
    const endDate = moment(`${year}-01-01`).endOf('year')

    api
      .get<Transaction[]>("/transactions", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          showOverlap: false
        }
      })
      .then(({ status, data }) => {
        if (status !== 200) {
          throw new Error("Failed to fetch transactions")
        }
        setTransactions(data)
      })
  }, [ year ])

  if (!transactions.length) {
    return <></>
  }

  const totalIncomePerMonth: Record<string, number> = {}
  const totalExpensesPerMonth: Record<string, number> = {}
  const spendPerTagPerMonth: Record<string, Record<string, number>> = {}
  const spendPerTag: Record<string, number> = {}
  const untaggedSpendPerMonth: Record<string, number> = {}
  const incomePerMonth: Record<string, Transaction[]> = {}

  for (const transaction of transactions) {
    const month = moment(transaction.posted_date).format("MMMM")
    const tag = transaction.tags?.length ? tagsInventory[transaction.tags[0].inventory_id].name : "Untagged"
    if (!spendPerTag[tag]) {
      spendPerTag[tag] = 0
    }
    spendPerTag[tag] += transaction.amount
    if (transaction.amount >= 0) {
      if (!incomePerMonth[month]) {
        incomePerMonth[month] = []
      }
      incomePerMonth[month].push(transaction)

      if (!totalIncomePerMonth[month]) {
        totalIncomePerMonth[month] = 0
      }
      totalIncomePerMonth[month] += transaction.amount
    } else {
      if (!totalExpensesPerMonth[month]) {
        totalExpensesPerMonth[month] = 0
      }
      totalExpensesPerMonth[month] += transaction.amount
    }

    if (!spendPerTagPerMonth[tag]) {
      spendPerTagPerMonth[tag] = {}
    }
    if (!spendPerTagPerMonth[tag][month]) {
      spendPerTagPerMonth[tag][month] = 0
    }
    spendPerTagPerMonth[tag][month] += transaction.amount

    if (!transaction.tags?.length && transaction.amount < 0) {
      if (!untaggedSpendPerMonth[month]) {
        untaggedSpendPerMonth[month] = 0
      }
      untaggedSpendPerMonth[month] += Math.abs(transaction.amount)
    }
  }

  console.log({
    totalIncomePerMonth,
    totalExpensesPerMonth,
    spendPerTagPerMonth,
    untaggedSpendPerMonth,
    incomePerMonth,
    spendPerTag
  })

  const widgetsLeft = []
  const widgetsMiddle = []
  const widgetsRight = []
  let flip = 0

  const superTotalIncome = Object.values(totalIncomePerMonth).reduce((acc, curr) => acc + curr, 0)
  const spendPerMonthKeys = Object.keys(spendPerTagPerMonth).sort((a, b) => spendPerTag[a] - spendPerTag[b])

  for (const spendingTag of spendPerMonthKeys) {
    const isExpanded = expanded.includes(spendingTag)

    const widget = <div className="block box" key={spendingTag} style={{ height: '500px' }}>
      <div className="level">
        <strong className="is-size-5">{ spendingTag }{' '}</strong>
        <div className="block buttons is-right are-small">
          <button className="button is-dark" type="button" onClick={() => {
            if (isExpanded){
              setExpanded(expanded.filter(tag => tag !== spendingTag))
            } else {
              setExpanded([...expanded, spendingTag])
            }
          }}>
            <span>Details</span>
            <span className="icon">
              <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
            </span>
          </button>
        </div>
      </div>
      <div className="level">
        <span>
          <span>${
            Math.abs(spendPerTag[spendingTag]).toFixed(2)  
          } total ({
            ((Math.abs(spendPerTag[spendingTag]) / superTotalIncome) * 100).toFixed(2)
          }%)</span>
        </span>
        <span>${
          Math.abs(spendPerTag[spendingTag] / months.length).toFixed(2)
        } average</span>
      </div>
        <BarChartThat
          data={{
            labels: months,
            datasets: [
              {
                label: spendingTag,
                data: months.map(month => Math.abs(spendPerTagPerMonth[spendingTag][month]) || 0),
                backgroundColor: "rgba(255, 0, 0, 0.5)"
              }
            ]
          }}
          canFullscreen
          isCurrency
        />
        { isExpanded
          ? <div className="block">
              <table className="table is-fullwidth">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  { transactions
                    .filter(transaction => transaction.tags?.length && tagsInventory[transaction.tags[0].inventory_id].name === spendingTag)
                    .map(transaction => (
                      <tr key={transaction.id}>
                        <td>{ moment(transaction.posted_date).format("MMM Do") }</td>
                        <td>{ transaction.amount }</td>
                        <td
                          data-tooltip={transaction.description}
                          className="is-capitalized"
                        >{ transaction.description
                          .toLowerCase()
                          .replace(/^Point\sOf\sSale\sWithdrawal\s\S*\s/i, '')
                          .replace(/^Withdrawal\s#\d*#\s/i, '')
                          .slice(0, 35)
                        }</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          : null
        }
      </div>
    if (flip % 3 === 0){
      widgetsLeft.push(widget)
    }
    else if (flip % 3 === 1){
      widgetsMiddle.push(widget)
    }
    else {
      widgetsRight.push(widget)
    }
    flip += 1
  }

  return <section className="section">
    <div className="container is-fluid">

      {/* Header */}
      <div className="level">
        <div className="">
          <h1 className="title">Dashboard</h1>
        </div>
        <div className="field has-addons">
          <div className="control">
            <div className="select">
              <select
                value={year}
                onChange={(event) => {
                  setYear(parseInt(event.target.value))
                }}
              >
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="block columns">
        
        <div className="column">
          <div className="block box">
            <h1 className="title">Total income</h1>
            <div className="level">
              <p className="is-size-5">${
                superTotalIncome.toFixed(2)
              } total</p>
              <p className="is-size-5">${
                (Object.values(totalIncomePerMonth).reduce((acc, curr) => acc + curr, 0) / months.length).toFixed(2)
              } average</p>
            </div>
            <BarChartThat
              data={{
                labels: Object.keys(incomePerMonth),
                datasets: [
                  {
                    label: "Income",
                    data: Object.values(totalIncomePerMonth),
                    backgroundColor: "rgba(0, 255, 0, 0.5)"
                  }
                ]
              }}
              canFullscreen
              isCurrency
            />
          </div>
        </div>
        <div className="column">
          <div className="block box">
            <h1 className="title">Untagged spending</h1>
            <div className="level">
              <p className="is-size-5">${
                Object.values(untaggedSpendPerMonth).reduce((acc, curr) => acc + curr, 0).toFixed(2)  
              } total</p>
              <p className="is-size-5">${
                (Object.values(untaggedSpendPerMonth).reduce((acc, curr) => acc + curr, 0) / months.length).toFixed(2)
              } average</p>
            </div>
            <BarChartThat
              data={{
                labels: Object.keys(untaggedSpendPerMonth),
                datasets: [
                  {
                    label: "Untagged spending",
                    data: Object.values(untaggedSpendPerMonth),
                    backgroundColor: "rgba(255, 0, 0, 0.5)"
                  }
                ]
              }}
              canFullscreen
              isCurrency
            />
          </div>
        </div>
        
      </div>
      <div className="block columns">
        
        <div className="column">
          { widgetsLeft }
        </div>
        <div className="column">
          { widgetsMiddle }
        </div>
        <div className="column">
          { widgetsRight }
        </div>
        
      </div>
    </div>
  </section>
}
