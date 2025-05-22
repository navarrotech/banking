// Copyright © 2024 Navarrotech

import { useEffect, useMemo, useState } from "react"
import type { TagInventory } from "@/types"
import api from "../common/axios"
import { useSelector } from "@/store"
import { ManualTag } from "@/components/Tags"
import DonutThat from "@/components/DonutThat"
import randomColor from "randomcolor"

const getSelection = () => localStorage.getItem('tag_inventory::selection')?.split(',') || []
const saveSelection = (selection: string[]) => localStorage.setItem('tag_inventory::selection', selection.join(','))
const appendSelection = (id: string) => saveSelection([ ...getSelection(), id ])

export default function AutoTags() {
  const [ open, setOpen ] = useState<boolean>(false)
  const [ selectedTag, setSelectedTag ] = useState<TagInventory | null>(null)
  const [ selection, setSelection ] = useState<string[]>(getSelection())

  const tags = useSelector(state => state.data.tagInventory.list)
  useEffect(() => saveSelection(selection), [ selection ])

  const donutData = useMemo(() => {
    const relevantTags = tags.filter(tag => selection.includes(tag.id))
    
    return relevantTags.map(t => ({
      label: t.name,
      value: t.amount || 0,
      color: t.color || randomColor()
    }))

  }, [ tags, selection ])

  console.log(donutData)

  return <section className="section">
    { open && <EditOrCreateTag tag={selectedTag} onClose={() => {
      setOpen(false)
      setSelectedTag(null)
    }} /> }
    <div className="container is-max-fullhd">

      <div className="block">
        <div className="level">
          <h1 className="title">Tags inventory</h1>
          <div className="block buttons is-right">
            <button className="button is-primary" type="button" onClick={() => setOpen(true)}>
              <span>Create</span>
            </button>
          </div>
        </div>
      </div>

      <div className="block columns">
        
        <div className="column is-one-third">
          <div className="block box">
            <DonutThat
              isCurrency
              data={donutData}
            />
          </div>
        </div>

        <div className="column">
          <div className="block box">
            <table className="table is-striped is-narrow is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th />
                  <th>Name</th>
                  <th>Appearance</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due date</th>
                  <th>Frequency</th>
                  <th/>
                </tr>
              </thead>
              <tbody>{
                tags.map(tag => <tr key={tag.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selection.includes(tag.id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelection([
                            ...selection,
                            tag.id
                          ])
                          return
                        }
                        setSelection(selection.filter(id => id !== tag.id))
                      }}
                    />
                  </td>
                  <td>
                    <span>{tag.name}</span>
                  </td>
                  <td>
                    <ManualTag
                      color={tag.color}
                      short={tag.short_name}
                      name={tag.name}
                    />
                  </td>
                  <td>
                    <span>{tag.description}</span>
                  </td>
                  <td>
                    <span>{tag.amount}</span>
                  </td>
                  <td>
                    <span>{tag.due_date}</span>
                  </td>
                  <td>
                    <span className="is-capitalized">{tag.frequency.toLowerCase()}</span>
                  </td>
                  <td>
                    <div className="block buttons is-right are-small" onClick={() => {
                      setSelectedTag(tag)
                      setOpen(true)
                    }}>
                      <button className="button is-primary" type="button">
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>)
                
              }</tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  </section>
}

type ModalProps = {
  tag: TagInventory | null
  onClose: () => void
}

const defaultTagInventory = (): TagInventory => ({
  id: "",
  name: "",
  short_name: "",
  description: "",
  color: randomColor(),

  amount: 0,
  start_date: null,
  end_date: null,
  due_date: null, 
  frequency: "MONTHLY"
})

function EditOrCreateTag({ tag, onClose }: ModalProps) {
  const [ state, setState ] = useState<Partial<TagInventory>>(tag ? tag :  { ...defaultTagInventory() })
  const isCreation = !tag

  async function submit() {
    const response = isCreation
      ? await api.post('/tags_inventory', state)
      : await api.patch('/tags_inventory', state)

    if (response.status === 200) {
      onClose()
      if (isCreation) {
        appendSelection(response.data.id)
      }
    }
    else {
      console.error(response)
    }
  }

  useEffect(() => {
    const keyEventListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
      else if (event.key === 'Enter' && event.ctrlKey) {
        submit()
      }
    }

    document.addEventListener('keydown', keyEventListener)
    return () => {
      document.removeEventListener('keydown', keyEventListener)
    }
  }, [])

  return <div className="modal is-active">
    <div className="modal-background" onClick={onClose}></div>
    <div className="modal-card">
      <header className="modal-card-head">
        {/* @ts-ignore */}
        <p className="modal-card-title">{ !isCreation ? (`Update ${tag.name}`) : "Create new tag" }</p>
        <button className="delete is-medium" onClick={onClose}></button>
      </header>
      <section className="modal-card-body">
        <label className="label">Name</label>
        <div className="field has-addons">
          <div className="control is-fullwidth">
            <input
              autoFocus
              className="input"
              type="text"
              value={state.name}
              placeholder="Power Bill"
              onChange={({ target:{ value } }) => { setState({ ...state, name: value }) }}
              onKeyDown={({ key=null, target }) => { if(['Enter', 'Escape', 'Esc'].includes(key)){ target.blur() } }}
            />
          </div>
          <div className="control">
            <input
              className="input"
              type="text"
              value={state.short_name}
              maxLength={8}
              placeholder="PWR"
              onChange={({ target:{ value } }) => { setState({ ...state, short_name: value }) }}
              onKeyDown={({ key=null, target }) => { if(['Enter', 'Escape', 'Esc'].includes(key)){ target.blur() } }}
            />
          </div>
        </div>
        <div className="field">
          <div className="control">
            <label className="label">Description</label>
            <textarea
              className="textarea"
              placeholder="Description"
              value={state.description}
              onChange={({ target:{ value } }) => { setState({ ...state, description: value }) }}
            />
          </div>
        </div>
        <div className="field has-addons">
          <div className="control">
            <label className="label">Amount</label>
            <input
              className="input"
              value={state.amount}
              placeholder="Est amount due"
              type="number"
              onChange={({ target:{ value } }) => { setState({ ...state, amount: value }) }}
              onKeyDown={({ key=null, target }) => { if(['Enter', 'Escape', 'Esc'].includes(key)){ target.blur() } }}
            />
          </div>
          <div className="control">
            <label className="label">Due Date</label>
            <input
              className="input"
              placeholder="Due date"
              type="number"
              value={state.due_date}
              onChange={({ target:{ value } }) => { setState({ ...state, due_date: value }) }}
            />
          </div>
          <div className="control">
            <label className="label">Frequency</label>
            <div className="select">
              <select
                value={state.frequency}
                onChange={({ target:{ value } }) => { setState({ ...state, frequency: value as any }) }}
              >
                <option value="NONE">None</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Biweekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>
        </div>
      </section>
      <footer className="modal-card-foot buttons is-right">
        <button className="button" type="button" onClick={onClose}>
          <span>Cancel</span>
        </button>
        <button className="button is-primary" type="button" onClick={submit}>
          <span>Save</span>
        </button>
      </footer>
    </div>
  </div>
}
