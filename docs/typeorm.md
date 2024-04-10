# Features
- Supports both DataMapper and ActiveRecord (your choice).
- Entities and columns.
- Database-specific column types.
- Entity manager.
- Repositories and custom repositories.
- Clean object-relational model.
- Associations (relations).
- Eager and lazy relations.
- Uni-directional, bi-directional, and self-referenced relations.
- Supports multiple inheritance patterns.
- Cascades.
- Indices.
- Transactions.
- Migrations and automatic migrations generation.
- Connection pooling.
- Replication.
- Using multiple database instances.
- Working with multiple database types.
- Cross-database and cross-schema queries.
- Elegant-syntax, flexible and powerful QueryBuilder.
- Left and inner joins.
- Proper pagination for queries using joins.
- Query caching.
- Streaming raw results.
- Logging.
- Listeners and subscribers (hooks).
- Supports closure table pattern.
- Schema declaration in models or separate configuration files.
- Supports MySQL / MariaDB / Postgres / CockroachDB / SQLite / Microsoft SQL Server / Oracle / SAP Hana / sql.js.
- Supports MongoDB NoSQL database.
- Works in NodeJS / Browser / Ionic / Cordova / React Native / NativeScript / Expo / Electron platforms.
- TypeScript and JavaScript support.
- ESM and CommonJS support.
- Produced code is performant, flexible, clean, and maintainable.
- Follows all possible best practices.
- CLI.

With TypeORM your models look like this:
```js
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number
}
```
And your domain logic looks like this:
```js
const userRepository = MyDataSource.getRepository(User)

const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
user.age = 25
await userRepository.save(user)

const allUsers = await userRepository.find()
const firstUser = await userRepository.findOneBy({
    id: 1,
}) // find by id
const timber = await userRepository.findOneBy({
    firstName: "Timber",
    lastName: "Saw",
}) // find by firstName and lastName

await userRepository.remove(timber)
```
Alternatively, if you prefer to use the ActiveRecord implementation, you can use it as well:
```js
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class User extends BaseEntity { // ActiveRecord implementation which extends baseEntity(Already implemented repository methods)
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number
}
```
And your domain logic will look this way:
```js
const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
user.age = 25
await user.save() // userRepository is not needed in this case

const allUsers = await User.find()
const firstUser = await User.findOneBy({
    id: 1,
})
const timber = await User.findOneBy({
    firstName: "Timber",
    lastName: "Saw"
})

await timber.remove()
```

