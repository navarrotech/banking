// Copyright © 2024 Navarrotech

import createAutoTagRule from "./auto_tag_rule/create"
import listAutoTagRules  from "./auto_tag_rule/list"
import updateAutoTagRule from "./auto_tag_rule/update"
import deleteAutoTagRule from "./auto_tag_rule/delete"

import createTag from "./tags/create"
import listTags  from "./tags/list"
import updateTag from "./tags/update"
import deleteTag from "./tags/delete"

import createTagInventory from "./tags_inventory/create"
import listTagInventory   from "./tags_inventory/list"
import updateTagInventory from "./tags_inventory/update"
import deleteTagInventory from "./tags_inventory/delete"

// import createTransaction from "./transactions/create"
import listTransactions  from "./transactions/list"
import updateTransaction from "./transactions/update"
import deleteTransaction from "./transactions/delete"

import retag from "./transactions/retag"

const routes = [
  // Auto tag rules
  { method: "post",     path: "/auto_tag_rule",       handler: createAutoTagRule  },
  { method: "get",      path: "/auto_tag_rule",       handler: listAutoTagRules   },
  { method: "patch",    path: "/auto_tag_rule",       handler: updateAutoTagRule  },
  { method: "delete",   path: "/auto_tag_rule",       handler: deleteAutoTagRule  },

  // Tags
  { method: "post",     path: "/tags",                handler: createTag          },
  { method: "get",      path: "/tags",                handler: listTags           },
  { method: "patch",    path: "/tags",                handler: updateTag          },
  { method: "delete",   path: "/tags",                handler: deleteTag          },

  // Tags Inventory
  { method: "post",     path: "/tags_inventory",      handler: createTagInventory },
  { method: "get",      path: "/tags_inventory",      handler: listTagInventory   },
  { method: "patch",    path: "/tags_inventory",      handler: updateTagInventory },
  { method: "delete",   path: "/tags_inventory",      handler: deleteTagInventory },

  // Transactions
  { method: "get",      path: "/transactions",        handler: listTransactions   },
  { method: "patch",    path: "/transactions",        handler: updateTransaction  },
  { method: "delete",   path: "/transactions",        handler: deleteTransaction  },
  { method: "post",     path: "/retag",               handler: retag              },
]

export default routes
