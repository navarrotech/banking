// Copyright © 2024 Navarrotech

import { useSelector } from "@/store"
import { useEffect } from "react"

type Props = {
  value: string | null | undefined
  onChange: (tagId: string) => void
  exclude?: string[]
}

export default function SelectTagInventory(props: Props) {
  const tagInventory = useSelector(state => state.data.tagInventory.list)

  useEffect(() => {
    if (!props.value && tagInventory.length > 0) {
      props.onChange(tagInventory[0]?.id)
    }
  }, [ props.value ])

  const filteredTagInventory = tagInventory
    .filter(tag => !props.exclude?.includes(tag.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  filteredTagInventory.push({
    id: "--",
    name: "--"
  })

  return <select
    onChange={e => props.onChange(e.target.value)}
    value={props.value || "--"}
    className={props.value === "--" ? "is-danger" : ""}
  >
    {
      filteredTagInventory.map(tag => <option key={tag.id} value={tag.id}>{ tag.name }</option>)  
    }
  </select>
}
