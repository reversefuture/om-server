# API
https://www.prisma.io/docs/orm/reference/prisma-client-reference?query=NOT&page=1

## Filter conditions and operators
**Equal to (equals or ==)**
>Syntax: fieldName: { equals: value }

**Not equal to (not or !=)**
>Syntax: fieldName: { not: value }

**Greater than (gt), Greater than or equal to (gte)**
>Syntax: fieldName: { gt: value }, fieldName: { gte: value }

**Less than (lt), Less than or equal to (lte)**
>Syntax: fieldName: { lt: value }, fieldName: { lte: value }

**In array (in), Not in array (notIn)**
>Syntax: fieldName: { in: [value1, value2, ...] }, fieldName: { notIn: [value1, value2, ...] }

**Contains (contains), Starts with (startsWith), Ends with (endsWith)**
>Syntax: fieldName: { contains: value }, fieldName: { startsWith: value }, fieldName: { endsWith: value }

**Logical AND (AND), OR (OR), NOT (NOT) - Combine multiple conditions**
>Syntax: { AND: [{ condition1 }, { condition2 }, ...] }

**Null (isNull)**
>Syntax: fieldName: { isNull: true }

# Start
> npm init -y
> npm install prisma typescript ts-node @types/node --save-dev
>npx tsc --init
You can now invoke the Prisma CLI by prefixing it with npx:
>npx prisma

set up your Prisma ORM project by creating your Prisma schema file with the following command:
>npx prisma init

In the **src/schema.prisma**:
```js
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```
In this schema, you configure three things:

>Data source: Specifies your database connection (via an environment variable)
>Generator: Indicates that you want to generate Prisma Client
>Data model: Defines your application models

DATABASE_URL  is defined in .env.
We recommend adding .env to your .gitignore file to prevent committing your environment variables.


## Using migrate
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

### Add additional fields to your schema:
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

## Prisma client
Prisma Client can be used in any Node.js (supported versions) or TypeScript backend application (including serverless applications and microservices). This can be a REST API, a GraphQL API, a gRPC API, or anything else that needs a database.

### Install Prisma Client
>npm install @prisma/client
This modules is similar to mysql client and other clients.

Whenever you update your Prisma schema, you will have to update your database schema using either **prisma migrate dev or prisma db push**. This will keep your database schema in sync with your Prisma schema. The commands will also regenerate Prisma Client.


# ORM
As an application developer, the mental model you have for your data is that of an object. The mental model for data in SQL on the other hand are tables.

As an example, consider how data is organized and relationships are handled with each approach:
>Relational databases: Data is typically normalized (flat) and uses foreign keys to link across entities. The entities then need to be JOINed to manifest the actual relationships.
>Object-oriented: Objects can be deeply nested structures where you can traverse relationships simply by using dot notation.

This alludes to one of the major pitfalls with traditional ORMs: While they make it seem that you can simply traverse relationships using familiar dot notation, under the hood the ORM generates SQL JOINs which are expensive and have the potential to drastically slow down your application (one symptom of this is the n+1 problem).

To conclude: The appeal of traditional ORMs is the premise of abstracting away the relational model and thinking about your data purely in terms of objects. While the premise is great, it's based on the wrong assumption that relational data can easily be mapped to objects which leads to lots of **complications and pitfalls**.

Prisma ORM's main goal is to make application developers more productive when working with databases. Considering the tradeoff between productivity and control again, this is how Prisma ORM fits in

## How ORM work?
### The Prisma schema
The Prisma schema allows developers to define their application models in an intuitive data modeling language

### The Prisma schema data model
**Functions of Prisma schema data models**
The data model is a collection of models. A model has two major functions:

>Represent a table in relational databases or a collection in MongoDB
>Provide the foundation for the queries in the Prisma Client API

**Getting a data model**
There are two major workflows for "getting" a data model into your Prisma schema:

>Manually writing the data model and mapping it to the database with Prisma Migrate
>Generating the data model by introspecting a database

Once the data model is defined, you can [generate Prisma Client](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client) which will expose CRUD and more queries for the defined models. 


### Accessing your database with Prisma Client
> npm install @prisma/client
Installing the @prisma/client package invokes the prisma generate command, which reads your Prisma schema and generates Prisma Client code. The code is generated into the node_modules/.prisma/client folder by default.

After you change your data model, you'll need to manually re-generate Prisma Client to ensure the code inside node_modules/.prisma/client gets updated:

>prisma generate

### Querying the database
#### findMany
```js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
  const allUsers = await prisma.user.findMany()
  console.log(allUsers)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

More complex:
```js
  const posts = await prisma.post.findMany({
    select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    where: { // where author is Joe and created after 2024-01-01 and (published or views gt 1000)
      author: {
        name: 'Joe',
      },
      createdAt: {
        gt: new Date('2024-01-01'),
      },
      OR: [
        { published: true },
        { views: { gt: 1000 } },
      ],
    },
    include: {
      comments: true,
    },
    relationLoadStrategy: 'join', //Specifies the load strategy for a relation query. Only available in combination with include
    orderBy: {
      createdAt: PostOrderByInput.Asc,
    },
    cursor: { //Specifies the position for the list
      id: 1,
    },
    take: 10, //Specifies how many objects should be returned
    skip: 0,
    distinct: ['title'],
  });
```

Get all Post records where the title field contains Prisma or databases, but not SQL, and the related User record' email address does not contain sarah
```js
const result = await prisma.post.findMany({
  where: {
    OR: [
      {
        title: {
          contains: 'Prisma',
        },
      },
      {
        title: {
          contains: 'databases',
        },
      },
    ],
    NOT: {
      title: {
        contains: 'SQL',
      },
    },
    user: {
      NOT: {
        email: {
          contains: 'sarah',
        },
      },
    },
  },
  include: {
    user: true,
  },
})
```

#### create
```js
async function main() {
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      posts: {
        create: { title: 'Hello World' },
      },
      profile: {
        create: { bio: 'I like turtles' },
      },
    },
  })

  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
    },
  })
  console.dir(allUsers, { depth: null })
}
```
This code creates a new User record together with new Post and Profile records using a nested write query. The User record is connected to the two other ones via the Post.author ↔ User.posts and Profile.user ↔ User.profile relation fields respectively.

Notice that you're passing the include option to findMany which tells Prisma Client to include the posts and profile relations on the returned User objects.

Execute:
>npx ts-node index.ts

#### filter
```js
// Run inside `async` function
const filteredPosts = await prisma.post.findMany({
  where: {
    OR: [
      { title: { contains: 'prisma' } },
      { content: { contains: 'prisma' } },
    ],
  },
})
```

#### All queryes
findMany
findFirst
findFirstOrThrow
findUnique # replace: findOne
findUniqueOrThrow
create
update
upsert
delete
createMany
updateMany
deleteMany

#### update
```js
// Run inside `async` function
const post = await prisma.post.update({
  where: { id: 42 },
  data: { published: true },
})
```

### Typical Prisma ORM workflows
1. Prisma Migrate
![image](/src/assets/img/prisma-migrate.PNG)

2. SQL migrations and introspection
![image](/src/assets/img/prisma-sql-introspection.PNG)
>Manually adjust your database schema using SQL or a third-party migration tool
>(Re-)introspect your database
>Optionally (re-)configure your Prisma Client API)
>(Re-)generate Prisma Client
>Use Prisma Client in your application code to access your database

## Data modeling
The term data modeling refers to the process of defining the shape and structure of the objects in an application, these objects are often called "application models". In relational databases (like PostgreSQL), they are stored in tables . When using document databases (like MongoDB), they are stored in collections.

Data modeling typically needs to happen on (at least) two levels:
>On the database level
>On the application level (i.e., in your programming language)

The key characteristic of an ORM is that it lets you **model your application data in terms of classes which are mapped to tables in the underlying database**.

### Data modeling on the database level
Check the schema aformentioned.
Prisma Client currently expects a consistent model and normalized model design. This means that:

>If a model or field is not present in the Prisma schema, it is ignored
>If a field is mandatory but not present in the MongoDB dataset, you will get an error

### Data modeling on the application level
```js
class User {
  constructor(user_id, name, email, isAdmin) {
    this.user_id = user_id
    this.name = name
    this.email = email
    this.isAdmin = isAdmin
  }
}
```

### Data modeling without Prisma ORM
application models are defined in your Prisma schema:

>Only Prisma Client: Application models in the Prisma schema are generated based on the **introspection of your database schema**. Data modeling happens primarily on the database-level.
>Prisma Client and Prisma Migrate: Data modeling happens in the Prisma schema by **manually adding application models to it**. Prisma Migrate maps these application models to tables in the underlying database (currently only supported for relational databases).

As an example, the User model from the previous example would be represented as follows in the Prisma schema:
```js
model User {
  user_id Int     @id @default(autoincrement())
  name    String?
  email   String  @unique
  isAdmin Boolean @default(false)
}
```
Once the application models are in your Prisma schema (whether they were added through introspection or manually by you), the next step typically is to generate Prisma Client which provides a programmatic and type-safe API to read and write data in the shape of your application models.

**Prisma Client uses TypeScript type aliases to represent your application models in your code**. For example, the User model would be represented as follows in the generated Prisma Client library:
```js
export declare type User = {
  id: number
  name: string | null
  email: string
  isAdmin: boolean
}
```
#### Using only Prisma Client
**When using only Prisma Client and not using Prisma Migrate in your application, data modeling needs to happen on the database level via SQL. Once your SQL schema is ready, you use Prisma's introspection feature to add the application models to your Prisma schema. Finally, you generate Prisma Client which creates the types as well as the programmatic API for you to read and write data in your database**.

Here is an overview of the main workflow:

>**Change your database schema using SQL** (e.g. CREATE TABLE, ALTER TABLE, ...)
>Run prisma db pull to introspect the database and add application models to the Prisma schema
>Run prisma generate to update your Prisma Client API

#### Using Prisma Client and Prisma Migrate
**When using Prisma Migrate, you define your application in the Prisma schema and with relational databases use the prisma migrate subcommand to generate plain SQL migration files, which you can edit before applying. With MongoDB, you use prisma db push instead which applies the changes to your database directly**.

Here is an overview of the main workflow:

>Manually change your application models in the Prisma schema (e.g. add a new model, remove an existing one, ...)
>Run prisma migrate dev to create and apply a migration or run prisma db push to apply the changes directly (in both cases Prisma Client is automatically generated)

# Using Prisma in app stack
[Examples](https://github.com/prisma/prisma-examples/)
## Express
```js
app.put('/publish/:id', async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true },
  })
  res.json(post)
})
```

