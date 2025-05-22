// Copyright © 2024 Navarrotech

import { useState } from "react"
import { useSelector } from "@/store"
import type { AutoTagRule } from "@/types"
import api from "../common/axios"
import SelectTagInventory from "@/components/SelectTagInventory"

export default function AutoTags() {
  const [ open, setOpen ] = useState<boolean | AutoTagRule>(false)

  const tags = useSelector(state => state.data.tagRules.list)

  return <section className="section">
    { open && <EditOrCreateTag autoTag={open} onClose={() => setOpen(false)} /> }
    <div className="container is-max-fullhd">

      <div className="block">
        <div className="level">
          <h1 className="title">Tag Rules</h1>
          <div className="block buttons is-right">
            <button className="button is-primary" type="button" onClick={() => setOpen(true)}>
              <span>Create</span>
            </button>
          </div>
        </div>
      </div>

      <div className="block box">
        <table className="table is-striped is-narrow is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Condition</th>
              <th>Description</th>
              <th />
            </tr>
          </thead>
          <tbody>{
            tags
            .map(tag => <tr key={tag.id}>
              <td>
                <span>{tag.name}</span>
              </td>
              <td>
                <span>{tag.value}</span>
              </td>
              <td>
                <span className="is-capitalized">{tag.condition.toLowerCase()}</span>
              </td>
              <td>
                <span>{tag.description}</span>
              </td>
              <td>
                <div className="block buttons is-right are-small" onClick={() => setOpen(tag)}>
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
  </section>
}

type ModalProps = {
  autoTag?: AutoTagRule | boolean
  onClose: () => void
}

const defaultAutoTag: AutoTagRule = {
  id: "",
  name: "",
  description: "",
  value: "",
  condition: "CONTAINS",
  inventory_id: "--",
}

function EditOrCreateTag({ autoTag, isCreate, onClose }: ModalProps) {
  const [ state, setState ] = useState<Partial<AutoTagRule>>(typeof autoTag === "boolean" ? { ...defaultAutoTag } : autoTag)

  const isCreation = typeof autoTag === "boolean" && !!autoTag

  console.log(state)

  const isValid = state.name && state.value && state.inventory_id && (state.inventory_id !== "--")

  async function submit() {
    if (!isValid) {
      return
    }
    const response = isCreation
      ? await api.post('/auto_tag_rule', state)
      : await api.patch('/auto_tag_rule', state)

    if (response.status === 200) {
      onClose()
    }
    else {
      console.error(response)
    }
  }

  return <div className="modal is-active">
    <div className="modal-background" onClick={onClose}></div>
    <div className="modal-card">
      <header className="modal-card-head">
        <p className="modal-card-title">{ !isCreation && autoTag ? (`Update ${autoTag.name}`) : "Create new rule" }</p>
        <button className="delete is-medium" onClick={onClose}></button>
      </header>
      <section className="modal-card-body">
        <div className="field">
          <label className="label">Rule Name</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={state.name}
              placeholder="Power Bill"
              onChange={({ target:{ value } }) => { setState({ ...state, name: value }) }}
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
        <label className="label">Rule</label>
        <div className="field has-addons">
          <div className="control">
            <div className="select">
              <select
                value={state.condition}
                onChange={({ target:{ value } }) => { setState({ ...state, condition: value as any }) }}
              >
                <option value="CONTAINS">Contains</option>
                <option value="STARTS_WITH">Starts with</option>
                <option value="ENDS_WITH">Ends with</option>
                <option value="IS">Is</option>
                <option value="IS_NOT">Is not</option>
                <option value="GREATER_THAN">Greater than</option>
                <option value="LESS_THAN">Less than</option>
                <option value="GREATER_THAN_OR_EQUAL">Greater than or equal</option>
                <option value="LESS_THAN_OR_EQUAL">Less than or equal</option>
                <option value="REGEX">Regex</option>
              </select>
            </div>
          </div>
          <div className="control is-fullwidth">
            <input
              className="input"
              type="text"
              value={state.value}
              placeholder="Description text or amount value to evaluate"
              onChange={({ target:{ value } }) => { setState({ ...state, value: value }) }}
              onKeyDown={({ key=null, target }) => { if(['Enter', 'Escape', 'Esc'].includes(key)){ target.blur() } }}
            />
          </div>
        </div>
        <div className="field is-fullwidth">
          <label className="label">On a match, apply the tag:</label>
          <div className="control is-fullwidth">
            <div className="select is-fullwidth">
              <SelectTagInventory
                value={state.inventory_id}
                onChange={(value) => setState({ ...state, inventory_id: value })}
              />
            </div>
          </div>
        </div>
      </section>
      <footer className="modal-card-foot buttons is-right">
        <button className="button" type="button" onClick={onClose}>
          <span>Cancel</span>
        </button>
        <button className="button is-primary" type="button" onClick={submit} disabled={!isValid}>
          <span>Save</span>
        </button>
      </footer>
    </div>
  </div>
}
