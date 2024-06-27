// Copyright © 2024 Navarrotech

import { useEffect, useState } from "react"
import api from "../common/axios"

import { dataActions } from "@/modules/data"
import { dispatch, useSelector } from "@/store"
import { AutoTagRule, Tag, TagInventory, Transaction } from "@/types"
import { useSearchParams } from "react-router-dom"
import moment from "moment"

type Props = {
  children: React.ReactNode
}

export default function Initialization({ children }: Props) {
  const [ initialized, setInitialized ] = useState(false)

  const startDate = useSelector(state => state.data.startDate)
  const endDate = useSelector(state => state.data.endDate)

  const [ searchParams ] = useSearchParams()

  const start = searchParams.get('start') || ''
  const end = searchParams.get('end') || ''

  useEffect(() => {
    if (start && start !== "null" && end && end !== "null") {
      dispatch(
        dataActions.setDates({
          startDate: moment(start),
          endDate: moment(end)
        })
      )
    }
  }, [])

  useEffect(() => {
    api.get<Transaction[]>("/transactions", {
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
        dispatch(
          dataActions.setTransactions(data)
        )
      })
    
      const url = new URL(window.location.href)

      if (startDate){
        url.searchParams.set('start', startDate.toISOString())
      } else {
        url.searchParams.delete('start')
      }
      if (endDate){
        url.searchParams.set('end', endDate.toISOString())
      } else {
        url.searchParams.delete('end')
      }
  
      window.history.replaceState(
        null,
        '',
        url.toString()
      )
  }, [ startDate, endDate ])

  useEffect(() => {
    Promise.all([
      api.get<AutoTagRule[]>("/auto_tag_rule")
        .then(({ status, data }) => {
          if (status !== 200) {
            throw new Error("Failed to fetch auto tag rule")
          }
          dispatch(
            dataActions.setTagRules(data)
          )
        }),
      api.get<TagInventory[]>("/tags_inventory")
        .then(({ status, data }) => {
          if (status !== 200) {
            throw new Error("Failed to fetch tags inventory")
          }
          dispatch(
            dataActions.setTagInventory(data)
          )
        }),
      api.get<Tag[]>("/tags")
        .then(({ status, data }) => {
          if (status !== 200) {
            throw new Error("Failed to fetch tags inventory")
          }
          dispatch(
            dataActions.setTags(data)
          )
        }),

    ]).then(() => setInitialized(true))
  }, [])

  if (!initialized){
    return <div className="container is-max-fullhd">
      <h1 className="title">Initializing...</h1>
    </div>
  }

  return children
}
