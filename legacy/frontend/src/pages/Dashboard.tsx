// Copyright © 2024 Navarrotech

import TransactionList from "../components/TransactionList"
import Retag from "@/components/Retag"
import SpendingCharts from "@/components/SpendingCharts"
import DateRanges from "@/components/DateRanges"

export default function Dashboard() {
  return <section className="section">
    <div className="container is-fluid">
      <div className="block columns">
        
        <div className="column">
          <div className="block level">
            <div className="field has-addons">
              <DateRanges />
            </div>
            <div className="buttons is-right">
              <Retag />
            </div>
          </div>
          <TransactionList />
        </div>

        <div className="column is-one-third">
          <SpendingCharts />
        </div>
        
      </div>
    </div>
  </section>
}
