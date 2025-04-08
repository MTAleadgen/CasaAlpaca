import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import path from "path"

// Load environment variables
config({ path: ".env.local" })

async function runMigrations() {
  console.log("Running database migrations...")

  const connectionString = process.env.DATABASE_URL!

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined")
  }

  // Create a Postgres connection
  const connection = postgres(connectionString, { max: 1 })

  // Create Drizzle instance
  const db = drizzle(connection)

  // Run migrations
  await migrate(db, { migrationsFolder: path.join(__dirname, "migrations") })

  console.log("Migrations completed successfully!")

  // Close the connection
  await connection.end()

  process.exit(0)
}

runMigrations().catch(error => {
  console.error("Error running migrations:", error)
  process.exit(1)
})
