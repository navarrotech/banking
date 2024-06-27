// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"
import type { matching_rule } from "@prisma/client"
import database from "@/lib/database"
import reapplyTags from "@/reapplyTags"

type Body = {
  condition?: matching_rule,
  description?: string,
  inventory_id?: string,
  name?: string,
  value?: string,
}

export default async function routes(request: Request, response: Response) {
  const {
    condition,
    description,
    inventory_id,
    name,
    value,
  } = request.body as Body

  const result = await database.auto_tag_rule.create({
    data: {
      condition,
      description,
      inventory_id,
      name,
      value,
    }
  })

  response.status(200).json(result)

  await reapplyTags()
}
