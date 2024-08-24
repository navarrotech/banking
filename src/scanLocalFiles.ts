// Copyright © 2024 Navarrotech

// CSV
import csvToJson from "csvtojson"

// Node.js
import fs from "fs"
import path from "path"
import database from "./lib/database"

const dataPath = path.join(__dirname, "..", "data")

type FileLink = {
  fileName: string
  filePath: string
  directoryName: Directories
}

type Directories = "amex"
  | "iccu.checkings"
  | "iccu.premiere_rewards"
  | "iccu.savings"
  | "links.amazon"

type Mapping = Record<Directories, {
  positive_is_income: boolean

  transaction_id: string
  amount: string
  posted_date: string
  description: string

  prefix?: string
  // notes?: string
}>

type Transaction = {
  transaction_id: string
  amount: number
  posted_date: Date
  description: string
}

const mapping: Mapping = {
  "iccu.checkings": {
    positive_is_income: true,
    transaction_id: "Transaction ID",
    amount: "Amount",
    posted_date: "Posting Date",
    description: "Description"
  },
  "iccu.savings": {
    positive_is_income: true,
    transaction_id: "Transaction ID",
    amount: "Amount",
    posted_date: "Posting Date",
    description: "Description"
  },
  "iccu.premiere_rewards": {
    positive_is_income: true,
    transaction_id: "Transaction ID",
    amount: "Amount",
    posted_date: "Posting Date",
    description: "Description"
  },
  "amex": {
    positive_is_income: false,
    transaction_id: "Reference",
    amount: "Amount",
    posted_date: "Date",
    description: "Description"
  },
  "links.amazon": {
    // Can't set to "Amazon" because it'll be auto tagged as shopping
    prefix: 'Amazn: ',
    positive_is_income: false,
    transaction_id: "ORDER_NUMBER",
    posted_date: "DATE_PLACED",
    amount: "TOTAL",
    description: "ITEM_NAMES",
    // notes: "INVOICE",
    // positive_is_income: "ITEMS_TOTAL",
    // positive_is_income: "INVOICE"
  }
}

// const paymentToTexts = new RegExp(
//     "(payment to american express)|"
//   + "(?:(mobile|online) payment - thank you)|"
//   + "(Credit\sCard\s:\sPrincipal\s\$)|"
//   + "(Credit Card Payment Received)"
//   , "gmi"
// )

// TODO: Remove the hardcoding
const accountNumbersToNames = {
  "*****8817": "Car Loan",
  "*****0314": "High Yield Savings",
  "*****0088": "Lilly's Checkings"
}

export default async function scanLocalFiles() {
  console.log("Scanning...")

  const files: FileLink[] = readDirectory(dataPath)
  const headers = {
    "iccu.checkings": undefined,
    "iccu.savings": undefined,
    "amex": undefined,
    "links.amazon": undefined,
  }
  const collection: Record<Directories, Transaction[]> = {
    "iccu.checkings": [],
    "iccu.premiere_rewards": [],
    "iccu.savings": [],
    "amex": [],
    "links.amazon": [],
  }

  // Gather all data
  for (const { filePath, fileName, directoryName } of files) {
    if (directoryName.startsWith("links.paypal")) {
      continue // Skip the links directory
    }
    if (!filePath.endsWith(".csv")) {
      if (!filePath.endsWith(".gitignore")) {
        console.error(`Skipping ${filePath} because it's not a CSV file`)
      }
      continue
    }

    console.log(`Now reading ${directoryName}/${fileName}`)

    // Header info, ensure consistency
    const rawData = fs.readFileSync(filePath, "utf-8")
    const header = rawData.split("\n")[0]
    if (!headers[directoryName]) {
      headers[directoryName] = header
    }
    if (headers[directoryName] !== header) {
      console.error({
        message: "The latest CSV you added might have different headers than others",
        expected: headers[directoryName],
        received: header
      })
      throw new Error(`Inconsistent headers on ${directoryName}/${fileName}!`)
    }

    const data: any[] = await csvToJson().fromFile(filePath)

    for (const row of data) {
      let amount = parseFloat(row[mapping[directoryName].amount])
      if (!mapping[directoryName].positive_is_income) {
        amount = amount * -1
      }

      let description = row[mapping[directoryName].description]

      Object
        .entries(accountNumbersToNames)
        .forEach(([key, value]) => {
          description = description.replace(key, `*${value}*`)
        })

      const ir: Transaction = {
        transaction_id: row[mapping[directoryName].transaction_id],
        amount,
        posted_date: new Date(row[mapping[directoryName].posted_date]),
        description,
      }

      // Cleanup/sanitization
      for (const key in ir) {
        if (ir[key] === undefined) {
          if (key === "amount") {
            ir[key] = 0.00
          }
          else {
            ir[key] = ""
          }
          continue
        }

        if (key === "amount") {
          if (isNaN(ir[key])) {
            console.log(ir)
            throw new Error(`Bad row isNaN on ${directoryName}/${fileName} :: ${row[mapping[directoryName].amount]}`)
          }
          continue
        }

        if (key === "posted_date") {
          if (isNaN(ir[key].getTime())) {
            console.log(ir)
            throw new Error(`Bad row invalid date on ${directoryName}/${fileName} :: ${row[mapping[directoryName].posted_date]}`)
          }
          continue
        }

        if (ir[key].startsWith('\'')) {
          ir[key] = ir[key].slice(1)
        }
        if (ir[key].endsWith('\'')) {
          ir[key] = ir[key].slice(0, -1)
        }

        ir[key] = ir[key]
          .replaceAll('\n', ' ')
          .replace(/\s+/g, ' ')
          .trim()

        if (key === 'description') {
          if (mapping[directoryName].prefix) {
            ir[key] = mapping[directoryName].prefix + ir[key]
          }
        }
      }
      if (!collection[directoryName]) {
        throw new Error(`Bad collection directoryName on '${directoryName}'`)
      }

      collection[directoryName].push(ir)
    }

    console.log(`  > Finished reading ${data.length} rows from csvs`)
  }

  // Insert data into the database
  // This is probably clunky and inefficient but it's ok :)
  const promises = []
  for (const directoryName in collection) {
    for (const transaction of collection[directoryName]) {

      // Check for overlapping transactions where the payment was transferred from one account to the other
      let is_overlap = false
      for (const directoryName2 in collection) {
        if (directoryName2 === directoryName) {
          continue
        }
        for (const transaction2 of collection[directoryName2]) {
          let transaction2Amount = transaction2.amount
          if (directoryName2.startsWith("links")) {
            transaction2Amount = transaction2Amount * -1
          }
          // Do the transactions match?
          if (transaction.amount === (transaction2Amount * -1)) {
            // Was it within one day of each other?
            const timeDiff = Math.abs(
              transaction.posted_date.getTime() - transaction2.posted_date.getTime()
            )
            const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))

            // A whitelist of what must match in order to be considered an overlap!
            // Removing because it doesn't cover refunds

            // const matchesText = !!transaction.description
            //   .toLowerCase()
            //   .match(paymentToTexts)

            // if (!matchesText) {
            //   console.log("Need to whitelist: " + transaction.description)
            //   continue
            // }

            if (diffDays <= 5) { // && matchesText
              is_overlap = true
              continue
            }
          }
        }
        if (is_overlap) {
          continue
        }
      }

      promises.push(
        database.transaction.upsert({
          where: {
            transaction_id: transaction.transaction_id
          },
          update: {
            ...transaction,
            source: directoryName,
            is_overlap
          },
          create: {
            ...transaction,
            source: directoryName,
            is_overlap
          },
        })
      )
    }
  }

  console.log(`  + Upserted ${promises.length} transactions`)

  await Promise.all(promises)
  console.log("Finished scanning!\n")
}

// Recursive read function
function readDirectory(directory: string) {
  let response: FileLink[] = []
  const files = fs.readdirSync(directory)

  for (const file of files) {
    const filePath = path.join(directory, file)

    if (fs.lstatSync(filePath).isDirectory()) {
      response.push(
        ...readDirectory(filePath)
      )
    }
    else {
      response.push({
        filePath,
        fileName: file,
        directoryName: directory.split(path.sep).pop().trim() as Directories
      })
    }
  }

  return response
}
