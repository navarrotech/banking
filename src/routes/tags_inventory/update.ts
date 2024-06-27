// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"
import type { frequency } from "@prisma/client"

import database from "@/lib/database"
import reapplyTags from "@/reapplyTags"

type Body = {
  id: string
  name?: string
  short_name?: string
  description?: string
  color?: string
  amount?: number
  start_date?: string
  end_date?: string
  due_date?: number
  frequency?: frequency
}

export default async function routes(request: Request, response: Response) {
  let {
    id,
    name,
    short_name,
    description,
    color,
    amount,
    start_date,
    end_date,
    due_date,
    frequency,
  } = request.body as Body

  if (start_date) {
    // @ts-ignore
    start_date = new Date(start_date)
  }
  if (end_date) {
    // @ts-ignore
    end_date = new Date(end_date)
  }
  if (typeof due_date === "string") {
    due_date = parseFloat(due_date)
  }
  if (typeof amount === "string") {
    amount = parseFloat(amount)
  }


  const result = await database.tag_inventory.update({
    where: {
      id
    },
    data: {
      name,
      short_name,
      description,
      color,
      amount,
      start_date,
      end_date,
      due_date,
      frequency,
    }
  })

  response.status(200).json(result)

  await reapplyTags()
}
