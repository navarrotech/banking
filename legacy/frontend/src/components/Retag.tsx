// Copyright © 2024 Navarrotech

import api from "@/common/axios"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faSync, faTimes } from "@fortawesome/free-solid-svg-icons"

export default function Retag() {
  const [ isLoading, setLoading ] = useState<boolean>(false)
  const [ isSuccess, setSuccess ] = useState<boolean | null>(null)

  useEffect(() => {
    if (isSuccess === null) {
      return
    }
    setTimeout(() => {
      setSuccess(null)
    }, 2_000)
  }, [ isSuccess ])

  async function retag() {
    if (isSuccess !== null) {
      return
    }

    setLoading(true)
    const startTime = Date.now()
    const result = await api.post("/retag")
    const endTime = Date.now()
    setLoading(false)
    setSuccess(result.status === 204)
    console.log("Retag took", endTime - startTime, "ms")
  }

  const color = isSuccess === null
    ? "primary"
    : isSuccess === true
      ? "success"
      : "danger"

  return <button
    className={`button is-${color} ${isLoading ? "is-loading" : ""}`}
    onClick={retag}
  >
    { isSuccess === null
      ? <>
        <span>Reapply Tags</span>
        <span className="icon">
          <FontAwesomeIcon icon={faSync} />
        </span>
      </>
      : isSuccess === true
        ? <>
          <span>Success</span>
          <span className="icon">
            <FontAwesomeIcon icon={faCheck} />
          </span>
        </>
        : <>
          <span>Failed</span>
          <span className="icon">
            <FontAwesomeIcon icon={faTimes} />
          </span>
        </>
    }
  </button>
}
