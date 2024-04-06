# Start
> npm init -y
> npm install prisma typescript ts-node @types/node --save-dev
>npx tsc --init
You can now invoke the Prisma CLI by prefixing it with npx:
>npx prisma

set up your Prisma ORM project by creating your Prisma schema file with the following command:
>npx prisma init

In the schema.prisma:
```js
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```
DATABASE_URL  is defined in .env

# Using migrate
https://www.prisma.io/docs/orm/prisma-migrate/getting-started

Creating the database schema **src/prisma/schema.prisma** cause typescript baseUrl is src
```js
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  published Boolean @default(true)
  authorId  Int
  author    User    @relation(fields: [authorId], references: [id])
}
```

To map your data model to the database schema, you need to use the prisma migrate CLI commands:
>npx prisma migrate dev --name init

- It creates a new SQL migration file for this migration
- It runs the SQL migration file against the database

## Add additional fields to your schema:
```js
model User {
  id       Int    @id @default(autoincrement())
   // new
  jobTitle String
  name     String
  posts    Post[]
}
```
run:
> npx prisma migrate dev --name added_job_title

You now have a migration history that you can source control and use to deploy changes to test environments and production.