// Copyright © 2024 Navarrotech

import { useMemo } from "react"
import { useSelector } from "@/store"


export default function TagAggregation() {
  const transactions = useSelector(state => state.data.transactions)
  const tagsInventory = useSelector(state => state.data.tags.list)

  const relevant = useMemo(() => {
    return transactions.reduce((acc, t) => {
      t.tags.forEach(tag => {
        if (tagsInventory[tag.inventory_id]) {
          if (!acc[tag.inventory_id]) {
            acc[tag.inventory_id] = {
              name: tagsInventory[tag.inventory_id].name,
              amount: 0,
              renew: 0,
              status: 0,
              due: 0,
              paid: 0,
            }
          }

          acc[tag.inventory_id].amount += t.amount
          acc[tag.inventory_id].renew += t.renew
          acc[tag.inventory_id].status += t.status
          acc[tag.inventory_id].due += t.due
          acc[tag.inventory_id].paid += t.paid
        }
      })

      return acc
    }, {} as Record<string, any>)

  }, [ transactions ])

  return <table className="table is-striped is-narrow is-hoverable is-fullwidth">
    <thead>
      <tr>
        <th>Name</th>
        <th>Amount</th>
        <th>Renews On</th>
        <th>Status</th>
        <th>Still due</th>
        <th>Actually paid</th>
      </tr>
    </thead>
    <tbody>{
      Object.keys(relevant).map(key => {
        const tag = relevant[key]
        return <tr key={key}>
          <td>{tag.name}</td>
          <td>{tag.amount}</td>
          <td>{tag.renew}</td>
          <td>{tag.status}</td>
          <td>{tag.due}</td>
          <td>{tag.paid}</td>
        </tr>
      })  
    }</tbody>
  </table>
}
