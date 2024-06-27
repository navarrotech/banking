// Copyright © 2024 Navarrotech

import type { PayloadAction } from "@reduxjs/toolkit"
import type { Transaction, AutoTagRule, Tag, TagInventory } from "@/types"

import { createSlice } from "@reduxjs/toolkit"
import moment, { type Moment } from "moment"


export type State = {
  transactions: Transaction[]
  tagRules: {
    byId: Record<string, AutoTagRule>
    list: AutoTagRule[]
  }
  tags: {
    byId: Record<string, Tag>
    list: Tag[]
  }
  tagInventory: {
    byId: Record<string, TagInventory>
    list: TagInventory[]
  },
  startDate: Moment
  endDate: Moment
}

const initialState: State = {
  startDate: moment().startOf('month'),
  endDate: moment().endOf('month'),
  transactions: [],
  tagRules: {
    byId: {},
    list: []
  },
  tags: {
    byId: {},
    list: []
  },
  tagInventory: {
    byId: {},
    list: []
  }
}

const slice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload
    },
    updateTransaction(state, action: PayloadAction<Transaction>) {
      const index = state.transactions.findIndex(t => t.id === action.payload.id)
      state.transactions[index] = action.payload
    },

    setTagRules(state, action: PayloadAction<AutoTagRule[]>) {
      state.tagRules.list = action.payload
      state.tagRules.byId = action.payload.reduce((acc, rule) => {
        acc[rule.id] = rule
        return acc
      }, {} as Record<string, AutoTagRule>)
    },
    createTagRule(state, action: PayloadAction<AutoTagRule>) {
      state.tagRules.list.push(action.payload)
      state.tagRules.byId[action.payload.id] = action.payload
    },
    updateTagRule(state, action: PayloadAction<AutoTagRule>) {
      const index = state.tagRules.list.findIndex(t => t.id === action.payload.id)
      state.tagRules.list[index] = action.payload
      state.tagRules.byId[action.payload.id] = action.payload
    },
    deleteTagRule(state, action: PayloadAction<AutoTagRule>) {
      state.tagRules.list = state.tagRules.list.filter(t => t.id !== action.payload.id)
      delete state.tagRules.byId[action.payload.id]
    },
  
    setTags(state, action: PayloadAction<Tag[]>) {
      state.tags.list = action.payload
      state.tags.byId = action.payload.reduce((acc, tag) => {
        acc[tag.id] = tag
        return acc
      }, {} as Record<string, Tag>)
    },
    createTag(state, action: PayloadAction<Tag>) {
      state.tags.list.push(action.payload)
      state.tags.byId[action.payload.id] = action.payload
    },
    updateTag(state, action: PayloadAction<Tag>) {
      const index = state.tags.list.findIndex(t => t.id === action.payload.id)
      state.tags.list[index] = action.payload
      state.tags.byId[action.payload.id] = action.payload
    },
    deleteTag(state, action: PayloadAction<Tag>) {
      state.tags.list = state.tags.list.filter(t => t.id !== action.payload.id)
      delete state.tags.byId[action.payload.id]
    },
  
    setTagInventory(state, action: PayloadAction<TagInventory[]>) {
      state.tagInventory.list = action.payload
      state.tagInventory.byId = action.payload.reduce((acc, tag) => {
        acc[tag.id] = tag
        return acc
      }, {} as Record<string, TagInventory>)
    },
    createTagInventory(state, action: PayloadAction<TagInventory>) {
      state.tagInventory.list.push(action.payload)
      state.tagInventory.byId[action.payload.id] = action.payload
    },
    updateTagInventory(state, action: PayloadAction<TagInventory>) {
      const index = state.tagInventory.list.findIndex(t => t.id === action.payload.id)
      state.tagInventory.list[index] = action.payload
      state.tagInventory.byId[action.payload.id] = action.payload
    },
    deleteTagInventory(state, action: PayloadAction<TagInventory>) {
      state.tagInventory.list = state.tagInventory.list.filter(t => t.id !== action.payload.id)
      delete state.tagInventory.byId[action.payload.id]
    },

    setDates(state, action: PayloadAction<{ startDate: Moment, endDate: Moment }>) {
      state.startDate = action.payload.startDate
      state.endDate = action.payload.endDate
    },
  
    reset() {
      return initialState
    }
  }
})

export const dataActions = slice.actions

export default slice
