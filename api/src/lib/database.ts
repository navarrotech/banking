
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function databaseStartup() {
  await prisma.$connect()
  console.log('Connected to the database')
}

export async function databaseShutdown() {
  await prisma.$disconnect()
  console.log('Disconnected from the database')
}
