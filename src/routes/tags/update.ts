// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"
import database from "@/lib/database"

type Body = {
  id: string
  notes?: string
  inventory_id?: string
}

export default async function routes(request: Request, response: Response) {
  const {
    id,
    notes,
    inventory_id,
  } = request.body as Body

  const result = await database.tags.update({
    where: {
      id
    },
    data: {
      auto_assigned: false,
      inventory_id,
      notes,
    }
  })

  response.status(200).json(result)
}
