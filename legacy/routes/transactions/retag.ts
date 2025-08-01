// Copyright © 2024 Navarrotech

import reapplyTags from "../../reapplyTags"

import type { Request, Response } from "express"

export default async function routes(request: Request, response: Response) {
  const isSuccessful = await reapplyTags()
  response.sendStatus(
    isSuccessful
      ? 204
      : 500
  )
}
