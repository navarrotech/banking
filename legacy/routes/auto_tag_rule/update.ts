// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"
import type { matching_rule } from "@prisma/client"
import database from "@/lib/database"

type Body = {
  id: string
  condition?: matching_rule,
  description?: string,
  inventory_id?: string,
  name?: string,
  value?: string,
}

export default async function routes(request: Request, response: Response) {
  const {
    id,
    condition,
    description,
    inventory_id,
    name,
    value,
  } = request.body as Body

  const result = await database.auto_tag_rule.update({
    where: {
      id
    },
    data: {
      condition,
      description,
      inventory_id,
      name,
      value,
    }
  })

  response.status(200).json(result)
}
