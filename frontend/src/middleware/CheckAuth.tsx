// Copyright © 2024 Navarrotech

import { useEffect, useState } from "react"
import api from "../common/axios"
import Authorize from "../components/Authorize"

type Props = {
  children: React.ReactNode
}

export default function CheckAuth({ children }: Props) {
  const [ cantConnect, setCantConnect ] = useState<boolean>(false)
  const [ loaded, setLoaded ] = useState<boolean>(false)
  const [ authorized, setAuthorized ] = useState<boolean>(false)
  const [ didRetry, setDidRetry ] = useState<boolean>(false)

  function testAuth(setRetry: boolean) {
    api.defaults.headers.Authorization = "Bearer " + localStorage.getItem("token")

    api
      .post('/ping')
      .then(({ status }) => {

        if (status === 200) {
          setAuthorized(true)
        }
        else if (status === 404) {
          setCantConnect(true)
        }

        setLoaded(true)
        setDidRetry(setRetry)
      })
  }

  useEffect(() => {
    testAuth(false)
  }, [])

  if (!loaded) {
    return <h1>Loading...</h1>
  }

  if (cantConnect) {
    return <h1>Cannot connect to server</h1>
  }

  if (!authorized) {
    return <Authorize retry={() => testAuth(true)} didRetry={didRetry} />
  }

  return children
}
