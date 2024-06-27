// Copyright © 2024 Navarrotech

import type { ChartData } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useEffect, useState } from 'react'

type Props = {
  data: ChartData<"bar", (number | [number, number] | null)[], string>
  isCurrency?: boolean
  canFullscreen?: boolean
}

export default function BarChartThat({ data, isCurrency = false, canFullscreen = false }: Props) {
  const [ isFullscreen, setIsFullscreen ] = useState<boolean>(false)

  useEffect(() => {
    const hotkeyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape'){
        setIsFullscreen(false)
      }
    }
    document.addEventListener('keydown', hotkeyListener)
    return () => document.removeEventListener('keydown', hotkeyListener)
  }, [])

  const chart = <Bar
    data={data}
    options={{
      plugins: {
        tooltip: {
          callbacks: {
            // @ts-ignore
            label: (context) => {
              if (isCurrency){
                // @ts-ignore
                return `$${parseFloat(context.raw).toFixed(2)}`
              }
              return context.raw
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
        },
        x: {
          stacked: true
        }
      }
    }}
  />

  if (isFullscreen) {
    function close(){
      setIsFullscreen(false)
    }
    return <div className="modal is-active">
      <div className="modal-background" onClick={close}></div>
      <div className="modal-content is-fluid">{
        chart  
      }</div>
      <button className="modal-close is-large" aria-label="close" />
    </div>
  }

  return <div className={canFullscreen ? "is-clickable" : ""} onClick={() => {
    if (canFullscreen){ 
      setIsFullscreen(true)
    }
  }}>{ chart }</div>
}
