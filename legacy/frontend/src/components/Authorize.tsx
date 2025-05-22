// Copyright © 2024 Navarrotech

import { useEffect, useState } from "react"

type Props = {
  retry: () => void
  didRetry: boolean
}

export default function Authorize({ retry, didRetry }: Props) {
  const [ token, setToken ] = useState<string>("")

  useEffect(() => {
    localStorage.setItem("token", token)
  }, [ token ])

  return <section className="section">
    <div className="hero is-fullheight">
      <div className="hero-body">
        <div className="container is-max-fullhd">
          <div className="block box">

            {/* Token input */}
            <div className="field">
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Token"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      retry()
                    }
                  }}
                />
              </div>
            </div>

            {/* Submit button */}
            <button className="button is-primary" type="button" onClick={() => retry()}>
              <span className="icon">
                {/* <FontAwesomeIcon icon={} /> */}
              </span>
              <span>Submit Token</span>
            </button>

            {/* Error */}
            { didRetry && <div className="notification is-danger">
              <button className="delete"></button>
              <span>Invalid token, didn't work</span>
            </div> }
          </div>
        </div>
      </div>
    </div>
  </section>
}
