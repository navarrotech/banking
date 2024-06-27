// Copyright © 2024 Navarrotech

import { useSelector, dispatch } from "@/store"
import { dataActions } from "@/modules/data"
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import moment from "moment"

export default function DateRanges() {
  const startDate = useSelector(state => state.data.startDate)
  const endDate = useSelector(state => state.data.endDate)

  return <>
    <div className="control">
      <div className="select">
        <select
          value={startDate.format("MMMM").toLowerCase()}
          onChange={(event) => {
            const month = event.target.value
            dispatch(
              dataActions.setDates({
                startDate: startDate.clone().month(month).startOf('month'),
                endDate: endDate.clone().month(month).endOf('month')
              })
            )
          }}
        >
          <option value="january">January</option>
          <option value="february">February</option>
          <option value="march">March</option>
          <option value="april">April</option>
          <option value="may">May</option>
          <option value="june">June</option>
          <option value="july">July</option>
          <option value="august">August</option>
          <option value="september">September</option>
          <option value="october">October</option>
          <option value="november">November</option>
          <option value="december">December</option>
        </select>
      </div>
    </div>
    <div className="control">
      <div className="select">
        <select
          value={startDate.format("YYYY")}
          onChange={(event) => {
            const year = parseInt(event.target.value)
            dispatch(
              dataActions.setDates({
                startDate: startDate.clone().year(year).startOf('year'),
                endDate: endDate.clone().year(year).endOf('year')
              })
            )
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
    <div className="control">
      <button className="button is-dark" type="button" onClick={() => {
        dispatch(
          dataActions.setDates({
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month')
          })
        )
      }}>
        <span>This Month</span>
        <span className="icon">
          <FontAwesomeIcon icon={faCalendarDays} />
        </span>
      </button>
    </div>
  </>
}
