const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no esta configurada');
}

const adapter = new PrismaPg({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  connectionTimeoutMillis: 10000
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;