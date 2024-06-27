// Copyright © 2024 Navarrotech
import 'dotenv/config'

const {
  NODE_ENV = 'development',
  PORT = '80',
  DATABASE_URL = 'postgres://postgres:postgres@co-op-mode-postgres:5432/postgres',
  SECURITY_AUTH_TOKEN = 'development',
} = process.env;

export {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  SECURITY_AUTH_TOKEN,
}
