// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"
import database from "@/lib/database"

type Body = {
  notes?: string
  inventory_id?: string
  transaction_id?: string
}

export default async function routes(request: Request, response: Response) {
  const {
    notes,
    inventory_id,
    transaction_id,
  } = request.body as Body

  const result = await database.tags.create({
    data: {
      auto_assigned: false,
      inventory_id,
      transaction_id,
      notes,
    }
  })

  response.status(200).json(result)
}
