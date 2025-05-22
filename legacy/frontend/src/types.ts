// Copyright © 2024 Navarrotech

import type { tags, tag_inventory, auto_tag_rule, transaction } from "@prisma/client"

export type Transaction = transaction & {
  tags: tags[]
}

export type TagInventory = tag_inventory & {

}

export type AutoTagRule = auto_tag_rule & {

}

export type Tag = tags & {

}
