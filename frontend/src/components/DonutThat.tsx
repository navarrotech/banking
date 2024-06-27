// Copyright © 2024 Navarrotech

import { Doughnut } from 'react-chartjs-2'
import { useEffect, useState } from 'react'

type Data = {
  label: string
  value: number
  color: string
}

type Props = {
  data: Data[]
  isCurrency?: boolean
  canFullscreen?: boolean
}

export default function DonutThat({ data, isCurrency = false, canFullscreen = false }: Props) {
  const [ isFullscreen, setIsFullscreen ] = useState<boolean>(false)

  const labels = data.map(d => d.label)
  const values = data.map(d => d.value)
  const colors = data.map(d => d.color)

  useEffect(() => {
    const hotkeyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape'){
        setIsFullscreen(false)
      }
    }
    document.addEventListener('keydown', hotkeyListener)
    return () => document.removeEventListener('keydown', hotkeyListener)
  }, [])

  const chart = <Doughnut
    data={{
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
      }],
    }}
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
