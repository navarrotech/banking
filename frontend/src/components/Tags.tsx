// Copyright © 2024 Navarrotech

import type { tags } from "../../../node_modules/@prisma/client"

import { useMemo } from "react"
import { useSelector } from "@/store"
import fontColorContrast from 'font-color-contrast'

type ManualTagProps = {
  color: string
  short: string
  name?: string
}

export function ManualTag({ name, color, short, ...rest }: ManualTagProps) {
  const fontColor = useMemo(() => fontColorContrast(color, 0.5), [ color ])

  return <span
    className="tag"
    data-tooltip={name}
    style={{
      color: fontColor,
      backgroundColor: color
    }}
    { ...rest }
  >{
    short
  }</span>
}

export function ManualTags({ tags }:{ tags: ManualTagProps[] }) {
  return <div className="tags">{
    tags.map(tag => <ManualTag key={tag.short} {...tag} />)
  }</div>
}

type Props = {
  tags: tags[]
  onDoubleClick?: (tag: tags) => void
}

export function Tags({ tags, ...rest }: Props) {
  return <div className="tags">{
    tags.map(tag => <Tag key={tag.id} tag={tag} {...rest} />)
  }</div>
}

type TagProps = {
  tag: tags
  onDoubleClick?: (tag: tags) => void
}

export function Tag({ tag, ...rest }: TagProps) {
  const tagInventory = useSelector(state => state.data.tagInventory.byId[tag.inventory_id])

  return <ManualTag
    color={tagInventory.color}
    short={tagInventory.short_name}
    name={tagInventory.name}
    { ...rest }
    // @ts-ignore
    onDoubleClick={() => rest.onDoubleClick?.(tag)}
  />
}
