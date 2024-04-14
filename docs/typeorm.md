# Features
https://typeorm.io/

- Supports both DataMapper and ActiveRecord (your choice).
- Entities and columns.
- Database-specific [column types](https://github.com/typeorm/typeorm/blob/master/docs/entities.md#column-types). 
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

## TypeScript configuration
Also, make sure you are using TypeScript version 4.5 or higher, and you have enabled the following settings in tsconfig.json:
```js
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

# Start
## Init
> npx typeorm init --name MyProject --database postgres
Or:
> You can generate an ESM project by running npx typeorm init --name MyProject --database postgres --module esm command.
> You can generate an even more advanced project with express installed by running npx typeorm init --name MyProject --database mysql --express command.
> You can generate a docker-compose file by running npx typeorm init --name MyProject --database postgres --docker command.

This command will generate a new project in the MyProject directory with the following files:
```yml
MyProject
├── src                   // place of your TypeScript code
│   ├── entity            // place where your entities (database models) are stored
│   │   └── User.ts       // sample entity
│   ├── migration         // place where your migrations are stored
│   ├── data-source.ts    // data source and all connection configuration
│   └── index.ts          // start point of your application
├── .gitignore            // standard gitignore file
├── package.json          // node module dependencies
├── README.md             // simple readme file
└── tsconfig.json         // TypeScript compiler options
```

The folders are not strictly necessary. They are just a convention to organize your code.

# Handle ORM
What are you expecting from ORM? First of all, you are expecting it will create database tables for you and find / insert / update / delete your data without the pain of having to write lots of hardly maintainable SQL queries
## Create model
Working with a database starts with creating tables: through the models and entities
```js
export class Photo {
    id: number
    name: string
    description: string
    filename: string
    views: number
    isPublished: boolean
}
```

## Create an entity
Entity is your model decorated by an @Entity decorator. A database table will be created for such models. You work with entities everywhere in TypeORM. **You can load/insert/update/remove and perform other operations with entity(some times you also need to use repository)**
```js
import { Entity } from "typeorm"

@Entity()
export class Photo {
    id: number
    name: string
    description: string
    filename: string
    views: number
    isPublished: boolean
}
```

## Adding table columns with @Column
## Creating a primary column with PrimaryColumn
```js
import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Photo {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    filename: string

    @Column()
    views: number

    @Column()
    isPublished: boolean
}
```

## Creating an auto-generated column with @PrimaryGeneratedColumn
```js
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    filename: string

    @Column()
    views: number

    @Column()
    isPublished: boolean
}
```
## Column data types
Next, let's fix our data types. By default, the string is mapped to a varchar(255)-like type (depending on the database type). The number is mapped to an integer-like type (depending on the database type). We don't want all our columns to be limited varchars or integers. Let's setup the correct data types:
```js
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        length: 100,
    })
    name: string

    @Column("text")
    description: string

    @Column()
    filename: string

    @Column("double")
    views: number

    @Column()
    isPublished: boolean
}
```

# Create data source
index.ts
```js
import "reflect-metadata"
import { DataSource } from "typeorm"
import { Photo } from "./entity/Photo"

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "root",
    password: "admin",
    database: "test",
    entities: [Photo],
    synchronize: true,
    logging: false,
})

// to initialize the initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error))
```
Now if you run your index.ts, a connection with the database will be initialized and a database table for your photos will be created.

# Interact with the database
# Creating and inserting a photo into the database
Now let's create a new photo to save it in the database:
```js
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const photo = new Photo()
photo.name = "Me and Bears"
photo.description = "I am near polar bears"
photo.filename = "photo-with-bears.jpg"
photo.views = 1
photo.isPublished = true

await AppDataSource.manager.save(photo)
console.log("Photo has been saved. Photo id is", photo.id)
```

## Using Entity Manager
Using Entity Manager
We just created a new photo and saved it in the database. We used EntityManager to save it. **EntityManager is just like a collection of all entity repositories in a single place**.
```js
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const savedPhotos = await AppDataSource.manager.find(Photo)
console.log("All photos from the db: ", savedPhotos)
```

## Using Repositories
Repository is just like EntityManager but its operations are limited to a concrete entity. You can access the repository via EntityManager.

Now let's refactor our code and use Repository instead of EntityManager. Each entity has its own repository which handles all operations with its entity. When you deal with entities a lot, Repositories are more convenient to use than EntityManagers:
```js
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const photoRepository = AppDataSource.getRepository(Photo)
await photoRepository.save(photo)
console.log("Photo has been saved")

const allPhotos = await photoRepository.find()
console.log("All photos from the db: ", allPhotos)

const firstPhoto = await photoRepository.findOneBy({
    id: 1,
})
console.log("First photo from the db: ", firstPhoto)

const meAndBearsPhoto = await photoRepository.findOneBy({
    name: "Me and Bears",
})
console.log("Me and Bears photo from the db: ", meAndBearsPhoto)

const allViewedPhotos = await photoRepository.findBy({ views: 1 })
console.log("All viewed photos: ", allViewedPhotos)

const allPublishedPhotos = await photoRepository.findBy({ isPublished: true })
console.log("All published photos: ", allPublishedPhotos)

const [photos, photosCount] = await photoRepository.findAndCount()
console.log("All photos: ", photos)
console.log("Photos count: ", photosCount)
```
## custom-repository
https://typeorm.io/custom-repository
```js
// user.repository.ts
export const UserRepository = dataSource.getRepository(User)

// user.controller.ts
export class UserController {
    users() {
        return UserRepository.find()
    }
}
```
In order to extend UserRepository functionality you can use .extend method of Repository class:
```js
// user.repository.ts
export const UserRepository = dataSource.getRepository(User).extend({
    findByName(firstName: string, lastName: string) {
        return this.createQueryBuilder("user")
            .where("user.firstName = :firstName", { firstName })
            .andWhere("user.lastName = :lastName", { lastName })
            .getMany()
    },
})

// user.controller.ts
export class UserController {
    users() {
        return UserRepository.findByName("Timber", "Saw")
    }
}
```
## Create class based repository
First reate entity:
```js
import { IsNotEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@models/users.interface';

@Entity()
export class UserEntity extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @Unique(['email'])
  email: string;

  @Column()
  @IsNotEmpty()
  password: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
```
and extend the Repository:
```js
import { Repository } from 'typeorm';
export class UserRepository extends Repository<UserEntity> {
  public async userFindAll(): Promise<User[]> {
    const users: User[] = await UserEntity.find();

    return users;
  }
.....
  public async userUpdate(userId: number, userData: UpdateUserDto): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    await UserEntity.update(userId, { ...userData, password: hashedPassword });

    const updateUser: User = await UserEntity.findOne({ where: { id: userId } });
    return updateUser;
  }

  public async userDelete(userId: number): Promise<User> {
    const findUser: User = await UserEntity.findOne({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await UserEntity.delete({ id: userId });
    return findUser;
  }
}
```

### Updating in the database
Now let's load a single photo from the database, update it and save it:
```js
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const photoRepository = AppDataSource.getRepository(Photo)
const photoToUpdate = await photoRepository.findOneBy({
    id: 1,
})
photoToUpdate.name = "Me, my friends and polar bears"
await photoRepository.save(photoToUpdate)
```

### Creating a one-to-one relation
Let's create a one-to-one relationship with another class. Let's create a new class in PhotoMetadata.ts. This PhotoMetadata class is supposed to contain our photo's additional meta-information:
```ts
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
} from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class PhotoMetadata {
    @PrimaryGeneratedColumn()
    id: number

    @Column("int")
    height: number

    @Column("int")
    width: number

    @Column()
    orientation: string

    @Column()
    compressed: boolean

    @Column()
    comment: string

    @OneToOne(() => Photo) //Create a one-to-one relationship 
    @JoinColumn() //indicates that this side of the relationship will own the relationship
    photo: Photo
}
```
If you run the app, you'll see a newly generated table, and it will contain a column with a foreign key for the photo relation

### Save a one-to-one relation
```js
import { Photo } from "./entity/Photo"
import { PhotoMetadata } from "./entity/PhotoMetadata"

// create a photo
const photo = new Photo()
photo.name = "Me and Bears"
photo.description = "I am near polar bears"
photo.filename = "photo-with-bears.jpg"
photo.views = 1
photo.isPublished = true

// create a photo metadata
const metadata = new PhotoMetadata()
metadata.height = 640
metadata.width = 480
metadata.compressed = true
metadata.comment = "cybershoot"
metadata.orientation = "portrait"
metadata.photo = photo // this way we connect them

// get entity repositories
const photoRepository = AppDataSource.getRepository(Photo)
const metadataRepository = AppDataSource.getRepository(PhotoMetadata)

// first we should save a photo
await photoRepository.save(photo)

// photo is saved. Now we need to save a photo metadata
await metadataRepository.save(metadata)

// done
console.log(
    "Metadata is saved, and the relation between metadata and photo is created in the database too",
)
```

### Inverse side of the relationship
Relations can be unidirectional or bidirectional. Let's  add an inverse relation, and make relations between PhotoMetadata and Photo bidirectional. 
```js
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
} from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class PhotoMetadata {
    /* ... other columns */

    @OneToOne(() => Photo, (photo) => photo.metadata) //(to, reverse)
    @JoinColumn()
    photo: Photo
}
```

```js
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from "typeorm"
import { PhotoMetadata } from "./PhotoMetadata"

@Entity()
export class Photo {
    /* ... other columns */

    @OneToOne(() => PhotoMetadata, (photoMetadata) => photoMetadata.photo)
    metadata: PhotoMetadata
}
```
Note that we should use the @JoinColumn decorator only on one side of a relation. Whichever side you put this decorator on will be the owning side of the relationship. The owning side of a relationship contains a column with a foreign key in the database.

### Relations in ESM projects
If you use ESM in your TypeScript project, you should use the Relation wrapper type in relation properties to avoid circular dependency issues. Let's modify our entities:
```js
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    Relation,
} from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class PhotoMetadata {
    /* ... other columns */

    @OneToOne(() => Photo, (photo) => photo.metadata)
    @JoinColumn()
    photo: Relation<Photo>  //void circular dependency issues!!
}
```
```js
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    Relation,
} from "typeorm"
import { PhotoMetadata } from "./PhotoMetadata"

@Entity()
export class Photo {
    /* ... other columns */

    @OneToOne(() => PhotoMetadata, (photoMetadata) => photoMetadata.photo)
    metadata: Relation<PhotoMetadata>
}
```

### Loading objects with their relations
Now let's load our photo and its photo metadata in a single query. There are two ways to do it - u**sing find* methods or using QueryBuilder functionality**.
```js
import { Photo } from "./entity/Photo"
import { PhotoMetadata } from "./entity/PhotoMetadata"
import { AppDataSource } from "./index"

const photoRepository = AppDataSource.getRepository(Photo)
const photos = await photoRepository.find({
    relations: {
        metadata: true,
    },
})
```
Here, photos will contain an array of photos from the database, and each photo will contain its photo metadata.

 QueryBuilder allows more complex queries to be used in an elegant way:
```js
import { Photo } from "./entity/Photo"
import { PhotoMetadata } from "./entity/PhotoMetadata"
import { AppDataSource } from "./index"

const photos = await AppDataSource.getRepository(Photo)
    .createQueryBuilder("photo")
    .innerJoinAndSelect("photo.metadata", "metadata")
    .getMany()
```

### Using cascades to automatically save related objects
```js
export class Photo {
    // ... other columns

    @OneToOne(() => PhotoMetadata, (metadata) => metadata.photo, {
        cascade: true,
    })
    metadata: PhotoMetadata
}
```
Using cascade allows us not to separately save photos and separately save metadata objects now. 
```js
import { AppDataSource } from "./index"

// create photo object
const photo = new Photo()
photo.name = "Me and Bears"
photo.description = "I am near polar bears"
photo.filename = "photo-with-bears.jpg"
photo.isPublished = true

// create photo metadata object
const metadata = new PhotoMetadata()
metadata.height = 640
metadata.width = 480
metadata.compressed = true
metadata.comment = "cybershoot"
metadata.orientation = "portrait"

photo.metadata = metadata // this way we connect them

// get repository
const photoRepository = AppDataSource.getRepository(Photo)

// saving a photo also save the metadata
await photoRepository.save(photo)

console.log("Photo is saved, photo metadata is saved too.")
```

### Creating a many-to-one / one-to-many relation
 Let's say a photo has one author, and each author can have many photos. First, let's create an Author class:
```js
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    JoinColumn,
} from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class Author {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => Photo, (photo) => photo.author) // note: we will create author property in the Photo class below
    photos: Photo[]
}
```
Author contains an inverse side of a relation. 
```js
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { PhotoMetadata } from "./PhotoMetadata"
import { Author } from "./Author"

@Entity()
export class Photo {
    /* ... other columns */

    @ManyToOne(() => Author, (author) => author.photos)
    author: Author
}
```
In many-to-one / one-to-many relations, the owner side is always many-to-one. It means that the class that uses @ManyToOne will store the id of the related object. In this case it's the Author.

### Creating a many-to-many relation
Let's say a photo can be in many albums, and each album can contain many photos. Let's create an Album class:
```js
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from "typeorm"

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany(() => Photo, (photo) => photo.albums)
    @JoinTable()
    photos: Photo[]
}
```
@JoinTable is required to specify that this is the owner side of the relationship.

Now let's add the inverse side of our relation to the Photo class:
```js
export class Photo {
    // ... other columns

    @ManyToMany(() => Album, (album) => album.photos)
    albums: Album[]
}
```
After you run the application, the ORM will create a album_photos_photo_albums junction table:
```md
+-------------+--------------+----------------------------+
|                album_photos_photo_albums                |
+-------------+--------------+----------------------------+
| album_id    | int(11)      | PRIMARY KEY FOREIGN KEY    |
| photo_id    | int(11)      | PRIMARY KEY FOREIGN KEY    |
```

## Using QueryBuilder
You can use QueryBuilder to build SQL queries of almost any complexity.
```js
const photos = await AppDataSource.getRepository(Photo)
    .createQueryBuilder("photo") // first argument is an alias. Alias is what you are selecting - photos. You must specify it.
    .innerJoinAndSelect("photo.metadata", "metadata")
    .leftJoinAndSelect("photo.albums", "album")
    .where("photo.isPublished = true")
    .andWhere("(photo.name = :photoName OR photo.name = :bearName)")
    .orderBy("photo.id", "DESC")
    .skip(5)
    .take(10)
    .setParameters({ photoName: "My", bearName: "Mishka" })
    .getMany()
```
This query selects all published photos with "My" or "Mishka" names. It will select results from position 5 (pagination offset) and will select only 10 results (pagination limit). The selection result will be ordered by id in descending order. The photo albums will be left joined and their metadata will be inner joined.


# Entities
## Column types for mysql / mariadb
bit, int, integer, tinyint, smallint, mediumint, bigint, float, double, double precision, dec, decimal, numeric, fixed, bool, boolean, date, datetime, timestamp, time, year, char, nchar, national char, varchar, nvarchar, national varchar, text, tinytext, mediumtext, blob, longtext, tinyblob, mediumblob, longblob, enum, set, json, binary, varbinary, geometry, point, linestring, polygon, multipoint, multilinestring, multipolygon, geometrycollection, uuid, inet4, inet6


# [typeorm-typedi-extensions](https://github.com/typestack/typeorm-typedi-extensions)
Dependency injection and service container integration with TypeORM using TypeDI library.

> npm install typeorm-typedi-extensions typedi reflect-metadata

> import 'reflect-metadata';

tsconfig.json
```js
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

Configure TypeORM in your app to use the TypeDI container before you create a connection:
```js
import { createConnection, useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';
//       ▲ Notice how we import container from this library, instead of TypeDI.

/** Tell TypeORM to use the container provided by this lib to resolve it's dependencies. */
useContainer(Container);

/** Create a connection and start using TypeORM. */
createConnection({
  /* <connection options> */
}).catch(error => {
  console.error(`Couldn't connect to the database!`);
  console.error(error);
});
```

## Usage
This package exposes three decorators all three decorators can be used on properties or on constructor parameters.

>IMPORTANT: To allow TypeDI to resolve the dependencies on your classes you must mark them with @Service decorator from the TypeDI package.

### @InjectConnection decorator
Injects Connection from where you can access anything in your connection. Optionally, you can specify a connection to inject by name in the decorator parameter.
```js
import { Service } from 'typedi';
import { Connection } from 'typeorm';
import { InjectConnection } from 'typeorm-typedi-extensions';

@Service()
export class MyCustomClass {
  @InjectConnection()
  private propertyInjectedConnection: Connection;

  constructor(@InjectConnection() private constructorInjectedConnection: Connection) {}
}
```
### @InjectManager decorator
Injects EntityManager from where you can access any entity in your connection. Optionally, you can specify a connection to inject by name in the decorator parameter.
```js
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

@Service()
export class MyCustomClass {
  @InjectManager()
  private propertyInjectedEntityManager: EntityManager;

  constructor(@InjectManager() private constructorInjectedEntityManager: EntityManager) {}
}
```

### @InjectRepository decorator
Injects Repository, MongoRepository, TreeRepository or custom repository of some Entity. Optionally, you can specify a connection to inject by name in the decorator parameter.
```js
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
// MyDatabaseModel is a TypeORM entity (class marked with `@Entity()` decorator)
import { MyDatabaseModel } from './entities/post.entity.ts';

@Service()
export class MyCustomClass {
  @InjectRepository(MyDatabaseModel) 
  private propertyInjectedRepository: Repository<MyDatabaseModel>;

  constructor(@InjectRepository(MyDatabaseModel) private constructorInjectedRepository: Repository<MyDatabaseModel>) {}
}
```
Example with custom connection name:
```js
@Service()
export class PostRepository {
  @InjectRepository(Post, 'custom-con-name')
  private repository: Repository<Post>;
}
```
You can also inject **custom Repository of some Entity**. To make this work have to create the class which extends the generic Repository<T> class and decorate it with EntityRepository<T> decorator.
```js
import { Service } from 'typedi';
import { Repository, EntityRepository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
// UserModel is a TypeORM entity (class marked with `@Entity()` decorator)
import { UserModel } from './entities/user.entity.ts';

@Service()
@EntityRepository(UserModel)
export class UserRepository extends Repository<UserModel> {
  public findByEmail(email: string) {
    return this.findOne({ email });
  }
}

@Service()
export class PostService {
  constructor(
    @InjectRepository()
    private readonly userRepository: UserRepository
  ) {}

  public async userExist(user: User): boolean {
    return (await this.userRepository.findByEmail(user.email)) ? true : false;
  }
}
```