// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"
import database from "@/lib/database"

type Body = {
  skip: number
  take: number
}

export default async function routes(request: Request, response: Response) {
  const {
    skip,
    take,
  } = request.query as unknown as Body

  const result = await database.tags.findMany({
    skip,
    take,
  })

  response.status(200).json(result)
}
