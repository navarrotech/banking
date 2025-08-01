// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"

import database from "@/lib/database"
import reapplyTags from "@/reapplyTags"

type Body = {
  id: string
}

export default async function routes(request: Request, response: Response) {
  const { id } = request.body as Body

  const result = await Promise.all([
    database.tag_inventory.delete({
      where: { id }
    }),
    database.tags.deleteMany({
      where: { inventory_id: id }
    }),
    database.auto_tag_rule.deleteMany({
      where: { inventory_id: id }
    })
  ])

  response.status(200).json(result)

  await reapplyTags()
}
