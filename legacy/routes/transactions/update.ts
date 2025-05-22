// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"
import database from "@/lib/database"

type Body = {
  id: string
  notes?: string
  is_hidden: boolean
}

export default async function routes(request: Request, response: Response) {
  const {
    id,
    notes = "",
    is_hidden
  } = request.body as Body

  const result = await database.transaction.update({
    where: {
      id
    },
    data: {
      notes,
      is_hidden
    }
  })

  const transaction = await database.transaction.findUnique({
    where: {
      id
    },
    include: {
      tags: true
    }
  })

  response.status(200).json(transaction)
}
