// Copyright © 2023 Navarrotech

// Core
import { Prisma, PrismaClient } from "@prisma/client"

const database = new PrismaClient()

export type PrismaTableNames = Prisma.ModelName
export const tables = Object.keys(database).filter((key) => !key.startsWith("$") && !key.startsWith("_"))

export async function initDatabase() {
    await database.$connect()

    console.log("[PASS] Database connected")
}

export async function closeDatabase() {
    await database.$disconnect()
}

export default database
