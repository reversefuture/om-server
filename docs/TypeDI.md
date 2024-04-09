# Start
TypeDI is a dependency injection library for TypeScript and JavaScript.
>npm install typedi reflect-metadata

Import the reflect-metadata package at the first line of your application:
```js
import 'reflect-metadata';
// Your other imports and initialization code
// comes here after you imported the reflect-metadata package!
```

As the last step, you need to enable emitting decorator metadata in your Typescript config. Add these two lines to your tsconfig.json file under the compilerOptions key:
```js
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

## Basic Usage
The most basic usage is to request an instance of a class definition. TypeDI will check if an instance of the class has been created before and return the cached version or it will create a new instance, cache, and return it.
```js
import { Container, Service } from 'typedi';

@Service()
class ExampleInjectedService {
  printMessage() {
    console.log('I am alive!');
  }
}

@Service()
class ExampleService {
  constructor(
    // because we annotated ExampleInjectedService with the @Service()
    // decorator TypeDI will automatically inject an instance of
    // ExampleInjectedService here when the ExampleService class is requested
    // from TypeDI.
    public injectedService: ExampleInjectedService
  ) {}
}

const serviceInstance = Container.get(ExampleService);
// we request an instance of ExampleService from TypeDI

serviceInstance.injectedService.printMessage();
// logs "I am alive!" to the console
```

## Registering dependencies
There are three ways to register your dependencies:
- annotating a class with the @Service() decorator (documentation)
- registering a value with a Token
- registering a value with a string identifier

The Token and string identifier can be used to register other values than classes. Both tokens and string identifiers can register any type of value including primitive values except undefined. Eg as [below](#using-containerget)

## Injecting dependencies
There are three ways to inject your dependencies:
- automatic class constructor parameter injection
- annotating class properties with the @Inject() decorator
- directly using Container.get() to request an instance of a class, Token or string identifier
### Constructor argument injection
Any class which has been marked **with the @Service() decorator will have it's constructor properties automatically injected with the correct dependency**.

TypeDI **inserts the container instance** which was used to resolve the dependencies as the last parameter in the constructor.
```js
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedClass {} // to be injected

@Service()
class ExampleClass {
  constructor(public injectedClass: InjectedClass) {} // auto injected InjectedClass into constructor's parameter
}

const instance = Container.get(ExampleClass);

console.log(instance.injectedClass instanceof InjectedClass);
// prints true as TypeDI assigned the instance of InjectedClass to the property
```

### Property injection
Any property which has been marked with the @Inject decorator will be automatically **assigned the instance of the class when the parent class is initialized by TypeDI**.
without the decorator, the property will stay undefined

```js
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedClass {} // to be injected

@Service()
class ExampleClass {
  @Inject()
  injectedClass: InjectedClass; // assigned the instance of the InjectedClass
}

const instance = Container.get(ExampleClass);

console.log(instance.injectedClass instanceof InjectedClass);
// prints true as the instance of InjectedClass has been assigned to the `injectedClass` property by TypeDI
```

### Using Container.get()
The Container.get() function can be used directly to request an instance of the target type. Container.get() can be used to request:
- a constructable value (class definition) which will return the class instance
- a Token which will return the value registered for that Token
- a string which will return the value registered with that name
```js
import 'reflect-metadata';
import { Container, Inject, Service, Token } from 'typedi';

const myToken = new Token('SECRET_VALUE_KEY');

@Service()
class InjectedClass {}

@Service()
class ExampleClass {
  @Inject()
  injectedClass: InjectedClass;
}

/** Tokens must be explicity set in the Container with the desired value. */
Container.set(myToken, 'my-secret-value');
/** String identifier must be explicity set in the Container with the desired value. */
Container.set('my-dependency-name-A', InjectedClass);
Container.set('my-dependency-name-B', 'primitive-value');

const injectedClassInstance = Container.get(InjectedClass);
// a class without dependencies can be required
const exampleClassInstance = Container.get(ExampleClass);
// a class with dependencies can be required and dependencies will be resolved
console.log(instance.injectedClass instanceof InjectedClass);// true, InjectedClass injected as property

const tokenValue = Container.get(myToken);
// tokenValue will be 'my-secret-value'
const stringIdentifierValueA = Container.get('my-dependency-name-A');
// stringIdentifierValueA will be instance of InjectedClass
const stringIdentifierValueB = Container.get('my-dependency-name-B');
// stringIdentifierValueB will be 'primitive-value'
```

## Singleton vs transient-短暂的 classes
Every registered service by default is a singleton. Meaning repeated calls to Container.get(MyClass) will return the same instance. If this is not the desired behavior a class can be marked as transient via the @Service() decorator.
```js
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service({ transient: true })
class ExampleTransientClass {
  constructor() {
    console.log('I am being created!');
    // this line will be printed twice
  }
}

const instanceA = Container.get(ExampleTransientClass);
const instanceB = Container.get(ExampleTransientClass);

console.log(instanceA !== instanceB);
// prints true
```

# @Inject decorator
The @Inject() decorator is a **property and parameter decorator used to resolve dependencies on a property of a class or a constructor parameter**. By default it infers the type of the property or argument and initializes an instance of the detected type, however, this behavior can be overwritten via specifying a custom constructable type, Token, or named service as the first parameter.

## Property injection
Check [Property injection](#property-injection)

## Constructor Injection
The @Inject decorator is not required in constructor injection when a class is marked with the @Service decorator. TypeDI will automatically infer and inject the correct class instances for every constructor argument. However, it can be used to overwrite the injected type.
```js
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedExampleClass {
  print() {
    console.log('I am alive!');
  }
}

@Service()
class ExampleClass {
  constructor(
    @Inject() // override
    public withDecorator: InjectedExampleClass,
    public withoutDecorator: InjectedExampleClass
  ) {}
}

const instance = Container.get(ExampleClass);

/**
 * The `instance` variable is an ExampleClass instance with both the
 * `withDecorator` and `withoutDecorator` property containing an
 * InjectedExampleClass instance.
 */
console.log(instance);

instance.withDecorator.print();
// prints "I am alive!" (InjectedExampleClass.print function)
instance.withoutDecorator.print();
// prints "I am alive!" (InjectedExampleClass.print function)
```

## Explicitly requesting target type
By default, TypeDI will try to infer the type of property and arguments and inject the proper class instance. When this is not possible (eg: the property type is an interface) there is three way to overwrite the type of the injected value:
- via @Inject(() => type) where type is a constructable value (eg: a class definition)
- via @Inject(myToken) where myToken is an instance of Token class
- via @Inject(serviceName) where serviceName is a string ID

In all three cases the requested dependency must be registered in the container first.
```js
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedExampleClass {
  print() {
    console.log('I am alive!');
  }
}

@Service()
class BetterInjectedClass {
  print() {
    console.log('I am a different class!');
  }
}

@Service()
class ExampleClass {
  @Inject()
  inferredPropertyInjection: InjectedExampleClass;

  /**
   * We tell TypeDI that initialize the `BetterInjectedClass` class
   * regardless of what is the inferred type.
   */
  @Inject(() => BetterInjectedClass)
  explicitPropertyInjection: InjectedExampleClass;

  constructor(
    public inferredArgumentInjection: InjectedExampleClass,
    /**
     * We tell TypeDI that initialize the `BetterInjectedClass` class
     * regardless of what is the inferred type.
     */
    @Inject(() => BetterInjectedClass)
    public explicitArgumentInjection: InjectedExampleClass
  ) {}
}

/**
 * The `instance` variable is an ExampleClass instance with both injectedE class instances
 */
const instance = Container.get(ExampleClass);

instance.inferredPropertyInjection.print();
// prints "I am alive!" (InjectedExampleClass.print function)
instance.explicitPropertyInjection.print();
// prints "I am a different class!" (BetterInjectedClass.print function)
instance.inferredArgumentInjection.print();
// prints "I am alive!" (InjectedExampleClass.print function)
instance.explicitArgumentInjection.print();
// prints "I am a different class!" (BetterInjectedClass.print function)
```

## Service Tokens
### Tokens with same name
Two token with the same name are different tokens. The name is only used to help the developer identify the tokens during debugging and development. (It's included in error the messages.)
```js
import 'reflect-metadata';
import { Container, Token } from 'typedi';

const tokenA = new Token('TOKEN');
const tokenB = new Token('TOKEN');

Container.set(tokenA, 'value-A');
Container.set(tokenB, 'value-B');

const tokenValueA = Container.get(tokenA);
// tokenValueA is "value-A"
const tokenValueB = Container.get(tokenB);
// tokenValueB is "value-B"

console.log(tokenValueA === tokenValueB);
// returns false, as Tokens are always unique
```

## Inheritance
**Inheritance is supported for properties when both the base and the extended class is marked with the @Service() decorator**. Classes which extend a class with decorated properties will receive the initialized class instances on those properties upon creation.
```js
import 'reflect-metadata';
import { Container, Token, Inject, Service } from 'typedi';

@Service()
class InjectedClass {
  name: string = 'InjectedClass';
}

@Service()
class BaseClass {
  name: string = 'BaseClass';

  @Inject()
  injectedClass: InjectedClass;
}

@Service()
class ExtendedClass extends BaseClass {
  name: string = 'ExtendedClass';
}

const instance = Container.get(ExtendedClass);
// instance has the `name` property with "ExtendedClass" value (overwritten the base class)
// and the `injectedClass` property with the instance of the `InjectedClass` class

console.log(instance.injectedClass.name);
// logs "InjectedClass"
console.log(instance.name);
// logs "ExtendedClass"
```

## Usage with TypeORM
To use TypeDI with routing-controllers and/or TypeORM, it's required to configure them to use the top-level TypeDI container used by your application.
```js
import { useContainer as rcUseContainer } from 'routing-controllers';
import { useContainer as typeOrmUseContainer } from 'typeorm';
import { Container } from 'typedi';

rcUseContainer(Container);
typeOrmUseContainer(Container);
```

# Advanced Usage
## Creating custom decorators
You can create your own decorators which will inject your given values for your service dependencies. For example:
```js
// Logger.ts
export function Logger() {
  return function (object: Object, propertyName: string, index?: number) {
    const logger = new ConsoleLogger();
    Container.registerHandler({ object, propertyName, index, value: containerInstance => logger });
  };
}

// LoggerInterface.ts
export interface LoggerInterface {
  log(message: string): void;
}

// ConsoleLogger.ts
import { LoggerInterface } from './LoggerInterface';

export class ConsoleLogger implements LoggerInterface {
  log(message: string) {
    console.log(message);
  }
}

// UserRepository.ts
@Service()
export class UserRepository {
  constructor(@Logger() private logger: LoggerInterface) {} // injected Loggger

  save(user: User) {
    this.logger.log(`user ${user.firstName} ${user.secondName} has been saved.`);
  }
}
```


