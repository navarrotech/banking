// Copyright © 2024 Navarrotech
0.
import type { Transaction } from '@/types'

import { useSearchParams } from 'react-router-dom'
import { useSelector, dispatch } from '@/store'
import { dataActions } from '@/modules/data'
import { Tags } from './Tags'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import api from '@/common/axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons'
import SelectTagInventory from './SelectTagInventory'
import SearchableDropdown from '@/common/SearchableDropdown'

export default function TransactionList() {
  const [ selected, setSelected ] = useState<Transaction | null>(null)

  const [searchParams] = useSearchParams()
  
  const q = searchParams.get('q') || ''
  const hasTag = searchParams.get('hasTag') || ''
  const positives = searchParams.get('positives') || ''
  const tags = searchParams.get('tags') || ''

  const [ search, setSearch ] = useState<string>(q)
  const [ filterSpecificTag, setFilterSpecificTag ] = useState<string[]>(tags ? tags.split(",") : [])
  const [ filterHasTag, setFilterHasTag ] = useState<boolean | null>(hasTag === "true" ? true : hasTag === "false" ? false : null)
  const [ filterPositives, setFilterPositives ] = useState<boolean | null>(positives === "true" ? true : positives === "false" ? false : null)

  console.log({
    q,
    hasTag,
    positives,
    tags,
    search,
    filterSpecificTag,
    filterHasTag,
    filterPositives
  })

  const inventoryById = useSelector(state => state.data.tagInventory.byId)
  let transactions = useSelector(state => state.data.transactions)

  const tagsInUse = useMemo(() => {
    return transactions.reduce((prev, transaction) => {
      transaction.tags.forEach(tag => {
        if (!prev[tag.inventory_id]) {
          prev[tag.inventory_id] = 1
        } else {
          prev[tag.inventory_id] += 1
        }
      })
      return prev
    }, {} as Record<string, number>)
  }, [ transactions ])

  if (search) {
    transactions = transactions.filter(transaction => {
      return transaction.description.trim().toLowerCase().includes(search.toLowerCase().trim())
    })
  }

  if (filterSpecificTag.length) {
    transactions = transactions.filter(transaction => {
      return transaction.tags.some(tag => filterSpecificTag.includes(tag.inventory_id))
    })
  }

  if (filterHasTag !== null) {
    transactions = transactions.filter(transaction => {
      return transaction.tags.length > 0 === filterHasTag
    })
  }

  if (filterPositives !== null) {
    transactions = transactions.filter(transaction => {
      return transaction.amount >= 0 === filterPositives
    })
  }

  useEffect(() => {
    const url = new URL(window.location.href)

    if (search){
      url.searchParams.set('q', search)
    } else {
      url.searchParams.delete('q')
    }
    if (filterSpecificTag.length){
      url.searchParams.set('tags', filterSpecificTag.join(','))
    } else {
      url.searchParams.delete('tags')
    }
    if (filterHasTag !== null){
      url.searchParams.set('hasTag', filterHasTag.toString())
    } else {
      url.searchParams.delete('hasTag')
    }
    if (filterPositives !== null){
      url.searchParams.set('positives', filterPositives.toString())
    } else {
      url.searchParams.delete('positives')
    }

    window.history.replaceState(
      null,
      '',
      url.toString()
    )

  }, [ search, filterSpecificTag, filterHasTag, filterPositives ])

  let total = 0
  transactions.forEach(transaction => {
    total += transaction.amount || 0
  })

  const filtersActive = filterSpecificTag.length || filterHasTag !== null || filterPositives !== null || search

  return <>
    { selected && <EditTransaction transaction={selected} close={() => setSelected(null)} /> }
    <div className="field has-addons">
      <div className="control has-icons-left is-fullwidth">
        <input
          autoFocus
          className="input"
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="icon is-left">
          <FontAwesomeIcon icon={faSearch} />
        </span>
      </div>
      <div className="control">
        <button
          className={`button is-${
            filterHasTag === null ? "dark" : filterHasTag ? "success" : "danger"
          }`}
          onClick={() => {
            if (filterHasTag === null) {
              return setFilterHasTag(true)
            }
            if (filterHasTag) {
              return setFilterHasTag(false)
            }
            setFilterHasTag(null)
          }}
          type="button"
        >
          <span>{
            filterHasTag === null ? "All tags" : filterHasTag ? "Has tags" : "Untagged"
          }</span>
        </button>
      </div>
      <div className="control">
        <button
          className={`button is-${
            filterPositives === null ? "dark" : filterPositives ? "success" : "danger"
          }`}
          onClick={() => {
            if (filterPositives === null) {
              return setFilterPositives(true)
            }
            if (filterPositives) {
              return setFilterPositives(false)
            }
            setFilterPositives(null)
          }}
          type="button"
        >
          <span>{
            filterPositives === null ? "All amounts" : filterPositives ? "Only income" : "Only expenses"
          }</span>
        </button>
      </div>
      <div className="control">
        <SearchableDropdown
          onSelect={(tag) => {
            if (filterSpecificTag.includes(tag)) {
              setFilterSpecificTag(
                filterSpecificTag.filter(t => t !== tag)
              )
            } else {
              setFilterSpecificTag(f => [ ...f, tag ])
            }
          }}
          options={Object
            .entries(tagsInUse)
            .sort(([id1, count1], [id2, count2]) => count2 - count1)
            .map(([id, count]) => ({
              id,
              key: id,
              text: inventoryById[id].name + " " + count,
              value: id,
            }))
          }
          isMulti
          value={filterSpecificTag}
        >
          <button className={`button is-${filterSpecificTag.length ? 'primary' : 'dark'}`} type="button">
            <span className="icon">
              <FontAwesomeIcon icon={faFilter} />
            </span>
            <span>Filter tags</span>
          </button>
        </SearchableDropdown>
      </div>
    </div>
    <table className="table is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th>Date</th>
          <th>Notes</th>
          <th>Amount</th>
          <th>Tags</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>{
        transactions.map(transaction => {
          const description = transaction.description
            .toLowerCase()
            .replace(/^Point\sOf\sSale\sWithdrawal\s\S*\s/i, '')
            .replace(/^Withdrawal\s#\d*#\s/i, '')

          return <tr key={transaction.id} className="is-clickable" onClick={() => setSelected(transaction)}>
            <td>
              <span style={{ whiteSpace: "nowrap" }}>{ moment(transaction.posted_date).format("MMM Do") }</span>
            </td>
            <td>
              <span>{ transaction.notes.slice(0, 17) }</span>
            </td>
            <td>
              <span className={transaction.amount >= 0 ? "has-text-primary has-text-weight-bold" : "has-text-danger"}>{ transaction.amount.toFixed(2) }</span>
            </td>
            <td>
              <Tags tags={transaction.tags} />
            </td>
            <td>
              <span
                className="is-capitalized"
                data-tooltip={transaction.description}
              >{ 
                description  
              }</span>
            </td>
          </tr>
        })
      }</tbody>
      { filtersActive
        ? <tfoot>
          <tr>
            <th colSpan={2}>Total</th>
            <th>{ total.toFixed(2) }</th>
            <th />
            <th colSpan={2} className='buttons is-right'>
              <button className="button is-dark is-small" onClick={() => {
                setSearch("")
                setFilterSpecificTag([])
                setFilterHasTag(null)
                setFilterPositives(null)
              }}>
                <span>Clear filters</span>
              </button>
            </th>
          </tr>
        </tfoot>
        : <></>
      }
    </table>
  </>
}

type EditTransactionProps = {
  transaction: Transaction
  close: () => void
}

function EditTransaction({ transaction, close }: EditTransactionProps) {
  const [ state, setState ] = useState<Transaction>(transaction)

  const [ newTagToAdd, setNewTagToAdd ] = useState<string>("")
  const automatedTags = state.tags.filter(tag => tag.auto_assigned)
  const manualTags = state.tags.filter(tag => !tag.auto_assigned)

  console.log(state)

  async function submit() {
    const result = await api.patch('/transactions', {
      id: state.id,
      notes: state.notes,
    })

    if (result.status === 200) {
      close()
    }
    else {
      console.error(result)
      alert("Failed to save transaction")
    }
  }

  async function addTag() {
    if (!newTagToAdd) {
      return
    }

    const result = await api.post('/tags', {
      inventory_id: newTagToAdd,
      transaction_id: state.id,
    })

    if (result.status !== 200) {
      console.error(result)
      alert("Failed to add tag")
    }
    else {
      setState({
        ...state,
        tags: [ ...state.tags, result.data ]
      })
      dispatch(
        dataActions.updateTransaction({
          ...state,
          tags: [ ...state.tags, result.data ]
        })
      )
    }
  }

  // Hotkeys
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close()
      }
      else if (e.key === "Enter") {
        submit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ state ])

  return <div className="modal is-active">
    <div className="modal-background" onClick={close}></div>
    <div className="modal-card">
      <header className="modal-card-head">
        <p className="modal-card-title">Edit Transaction</p>
        <button className="delete is-medium" onClick={close}></button>
      </header>
      <section className="modal-card-body">
        <div className="field">
          <h1 className="title is-size-5">{ state.description }</h1>
        </div>
        <div className="field">
          <div className="level">
            <p>Amount: </p>
            <p>{ transaction.amount }</p>
          </div>
          <div className="level">
            <p>Source: </p>
            <p>{ transaction.source }</p>
          </div>
          <div className="level">
            <p>Posted Date: </p>
            <p>{ moment(transaction.posted_date).format("MMMM Do, YYYY") }</p>
          </div>
        </div>
        <div className="field">
          <label className="label">Notes</label>
          <div className="control">
            <textarea
              autoFocus
              className="textarea"
              placeholder="Notes"
              value={state.notes}
              onChange={e => setState({ ...state, notes: e.target.value })}
            />
          </div>
        </div>
        <label className="label">Automated tags</label>
        <div className="field">
          { automatedTags.length ? <Tags tags={automatedTags} /> : <p>No automatically added tags</p> }
        </div>
        <label className="label">Manually added tags</label>
        <div className="field">
          { manualTags.length ? <Tags tags={manualTags} onDoubleClick={async (tag) => {
            const result = await api.delete(`/tags?id=${tag.id}`)
            if (result.status === 200) {
              setState({
                ...state,
                tags: state.tags.filter(t => t.id !== tag.id)
              })
              dispatch(
                dataActions.updateTransaction({
                  ...state,
                  tags: state.tags.filter(t => t.id !== tag.id)
                })
              )
            }
          }}/> : <p>No manual tags</p> }
        </div>
        <label className="label">Add new tag</label>
        <div className="field has-addons">
          <div className="control is-fullwidth">
            <div className="select is-fullwidth">
              <SelectTagInventory
                value={newTagToAdd}
                onChange={setNewTagToAdd}
                exclude={state.tags.map(tag => tag.inventory_id)}
              />
            </div>
          </div>
          <div className="control">
            <button className="button is-primary" type="button" onClick={addTag}>
              <span>Add</span>
              <span className="icon">
                <FontAwesomeIcon icon={faPlus} />
              </span>
            </button>
          </div>
        </div>
      </section>
      <footer className="modal-card-foot buttons is-right">
        <button className="button" type="button" onClick={close}>
          <span>Cancel</span>
        </button>
        <button className="button is-primary" type="button" onClick={submit}>
          <span>Save</span>
        </button>
      </footer>
    </div>
  </div>
}
