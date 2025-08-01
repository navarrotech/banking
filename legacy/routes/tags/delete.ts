// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"
import database from "@/lib/database"

type Body = {
  id: string
}

export default async function routes(request: Request, response: Response) {
  const { id } = request.query as Body

  const result = await database.tags.delete({
    where: {
      id
    }
  })

  response.status(200).json(result)
}
