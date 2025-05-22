// Copyright © 2024 Navarrotech

import type { Request, Response } from "express"
import database from "@/lib/database"

type Body = {
  skip: number
  take: number
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  description?: string
  showHidden?: boolean
  showOverlap?: boolean
}

export default async function routes(request: Request, response: Response) {
  let {
    skip,
    take,
    description,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    showHidden,
    showOverlap,
  } = request.query as unknown as Body

  if (typeof showOverlap === "string") {
    showOverlap = showOverlap === "true"
  }
  if (typeof showHidden === "string") {
    showHidden = showHidden === "true"
  }
  if (typeof take === "string") {
    take = parseInt(take)
  }
  if (typeof skip === "string") {
    skip = parseInt(skip)
  }

  const result = await database.transaction.findMany({
    where: {
      description: {
        contains: description
      },
      amount: {
        gte: minAmount,
        lte: maxAmount
      },
      posted_date: {
        gte: startDate,
        lte: endDate
      },
      is_hidden: showHidden,
      is_overlap: showOverlap,
    },
    orderBy: {
      posted_date: 'asc'
    },
    include: {
      _count: true,
      tags: true
    },
    skip,
    take,
  })

  response.status(200).json(result)
}
