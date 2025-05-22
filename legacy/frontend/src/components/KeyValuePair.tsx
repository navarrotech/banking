// Copyright © 2024 Navarrotech

type Props = {
  k: string
  v: string
}

export default function KeyValue({ k, v }: Props) {
  return <div className="flex items-center space-between is-fullwidth">
    <span>{k}</span>{' '}
    <span>{v}</span>
  </div>
}
