# Metadata Reflection API
https://rbuckton.github.io/reflect-metadata/#syntax
Proposal to add Metadata to ECMAScript.

# Usage
## ES Modules in NodeJS/Browser, TypeScript/Babel, Bundlers 
```js
// - Modifies global `Reflect` object (or defines one in ES5 runtimes).
// - Supports ESM and CommonJS.
// - Contains internal polyfills for `Map`, `Set`, and `WeakMap` for older runtimes.
import "reflect-metadata";

// - Modifies global `Reflect` object (or defines one in ES5 runtimes).
// - Supports ESM and CommonJS.
// - Requires runtime support for `"exports"` in `package.json`.
// - Does not include internal polyfills.
import "reflect-metadata/lite";
```
# Goals
- A number of use cases (Composition/Dependency Injection, Runtime Type Assertions, Reflection/Mirroring, Testing) want the ability to add additional metadata to a class in a consistent manner.
- A consistent approach is needed for various tools and libraries to be able to reason over metadata.
- Metadata-producing decorators (nee. "Annotations") need to be generally composable with mutating decorators.
- Metadata should be available not only on an object but also through a Proxy, with related traps.
- Defining new metadata-producing decorators should not be arduous or over-complex for a developer.
- Metadata should be consistent with other language and runtime features of ECMAScript.

# Syntax
Declarative definition of metadata:
```js
class C {
  @Reflect.metadata(metadataKey, metadataValue)
  method() {
  }
}
```
Imperative definition of metadata:
```js
// define metadata on an object or property
Reflect.defineMetadata(metadataKey, metadataValue, target);
Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);

// check for presence of a metadata key on the prototype chain of an object or property
let result = Reflect.hasMetadata(metadataKey, target);
let result = Reflect.hasMetadata(metadataKey, target, propertyKey);

// check for presence of an own metadata key of an object or property
let result = Reflect.hasOwnMetadata(metadataKey, target);
let result = Reflect.hasOwnMetadata(metadataKey, target, propertyKey);

// get metadata value of a metadata key on the prototype chain of an object or property
let result = Reflect.getMetadata(metadataKey, target);
let result = Reflect.getMetadata(metadataKey, target, propertyKey);

// get metadata value of an own metadata key of an object or property
let result = Reflect.getOwnMetadata(metadataKey, target);
let result = Reflect.getOwnMetadata(metadataKey, target, propertyKey);

// get all metadata keys on the prototype chain of an object or property
let result = Reflect.getMetadataKeys(target);
let result = Reflect.getMetadataKeys(target, propertyKey);

// get all own metadata keys of an object or property
let result = Reflect.getOwnMetadataKeys(target);
let result = Reflect.getOwnMetadataKeys(target, propertyKey);

// delete metadata from an object or property
let result = Reflect.deleteMetadata(metadataKey, target);
let result = Reflect.deleteMetadata(metadataKey, target, propertyKey);

// apply metadata via a decorator to a constructor
@Reflect.metadata(metadataKey, metadataValue)
class C {
  // apply metadata via a decorator to a method (property)
  @Reflect.metadata(metadataKey, metadataValue)
  method() {
  }
}

// Design-time type annotations
function Type(type) { return Reflect.metadata("design:type", type); }
function ParamTypes(...types) { return Reflect.metadata("design:paramtypes", types); }
function ReturnType(type) { return Reflect.metadata("design:returntype", type); }

// Decorator application
@ParamTypes(String, Number)
class C {
  constructor(text, i) {
  }

  @Type(String)
  get name() { return "text"; }

  @Type(Function)
  @ParamTypes(Number, Number)
  @ReturnType(Number)
  add(x, y) {
    return x + y;
  }
}

// Metadata introspection
let obj = new C("a", 1);
let paramTypes = Reflect.getMetadata("design:paramtypes", obj, "add"); // [Number, Number]
```

# Abstract Operations
## Operations on Objects
When the abstract operation **GetOrCreateMetadataMap** is called with Object O, property key P, and Boolean Create the following steps are taken:

- Assert: P is undefined or IsPropertyKey(P) is true.
- Let targetMetadata be the value of O's [[Metadata]] internal slot.
    + If targetMetadata is undefined, then
    + If Create is false, return undefined.
    + Set targetMetadata to be a newly created Map object.
- Set the [[Metadata]] internal slot of O to targetMetadata.
- Let metadataMap be ? Invoke(targetMetadata, "get", P).
- If metadataMap is undefined, then
    + If Create is false, return undefined.
    + Set metadataMap to be a newly created Map object.
    + Perform ? Invoke(targetMetadata, "set", P, metadataMap).
- Return metadataMap.

# Ordinary and Exotic Objects Behaviors
##  Ordinary Object Internal Methods and Internal Slots
All ordinary objects have an internal slot called [[Metadata]]. The value of this internal slot is either null or a Map object and is used for storing metadata for an object.
-  [[HasMetadata]] ( MetadataKey, P )
    + Return ? OrdinaryHasMetadata(MetadataKey, O, P).
-  OrdinaryHasMetadata ( MetadataKey, O, P ) .....
- [[HasOwnMetadata]] ( MetadataKey, P ) .....
......

# Reflection
This section contains amendments to the Reflect object.

##  Metadata Decorator Functions
A metadata decorator function is an anonymous built-in function that has [[MetadataKey]] and [[MetadataValue]] internal slots.

When a metadata decorator function F is called with arguments target and key, the following steps are taken:

Assert: F has a [[MetadataKey]] internal slot whose value is an ECMAScript language value, or undefined.
Assert: F has a [[MetadataValue]] internal slot whose value is an ECMAScript language value, or undefined.
If Type(target) is not Object, throw a TypeError exception.
If key is not undefined and IsPropertyKey(key) is false, throw a TypeError exception.
Let metadataKey be the value of F's [[MetadataKey]] internal slot.
Let metadataValue be the value of F's [[MetadataValue]] internal slot.
Perform ? target.[[DefineMetadata]](metadataKey, metadataValue, target, key).
Return undefined.
##  Reflect.metadata ( metadataKey, metadataValue )
When the metadata function is called with arguments metadataKey and metadataValue, the following steps are taken:

Let decorator be a new built-in function object as defined in Metadata Decorator Functions.
Set the [[MetadataKey]] internal slot of decorator to metadataKey.
Set the [[MetadataValue]] internal slot of decorator to metadataValue.
Return decorator.
##  Reflect.defineMetadata ( metadataKey, metadataValue, target [, propertyKey] )
When the defineMetadata function is called with arguments metadataKey, metadataValue, target, and propertyKey, the following steps are taken:

If Type(target) is not Object, throw a TypeError exception.
Return ? target.[[DefineMetadata]](metadataKey, metadataValue, propertyKey).
##  Reflect.hasMetadata ( metadataKey, target [, propertyKey] )
When the hasMetadata function is called with arguments metadataKey, target, and propertyKey, the following steps are taken:

If Type(target) is not Object, throw a TypeError exception.
Return ? target.[[HasMetadata]](metadataKey, propertyKey).
##  Reflect.hasOwnMetadata ( metadataKey, target [, propertyKey] )
When the hasOwnMetadata function is called with arguments metadataKey, target, and propertyKey, the following steps are taken:

If Type(target) is not Object, throw a TypeError exception.
Return ? target.[[HasOwn]](metadataKey, propertyKey).
##  Reflect.getMetadata ( metadataKey, target [, propertyKey] )
When the getMetadata function is called with arguments metadataKey, target, and propertyKey, the following steps are taken:

If Type(target) is not Object, throw a TypeError exception.
Return ? target.[[GetMetadata]](metadataKey, propertyKey).
##  Reflect.getOwnMetadata ( metadataKey, target [, propertyKey] )
When the getOwnMetadata function is called with arguments metadataKey, target, and propertyKey, the following steps are taken:

If Type(target) is not Object, throw a TypeError exception.
Return ? target.[[GetOwnMetadata]](metadataKey, propertyKey).
##  Reflect.getMetadataKeys ( target [, propertyKey] )
When the getMetadataKeys function is called with arguments target and propertyKey, the following steps are taken:

If Type(target) is not Object, throw a TypeError exception.
Return ? target.[[GetMetadataKeys]](propertyKey).
##  Reflect.getOwnMetadataKeys ( target [, propertyKey] )
When the getOwnMetadataKeys function is called with arguments target and propertyKey, the following steps are taken:

If Type(target) is not Object, throw a TypeError exception.
Return ? target.[[GetOwnMetadataKeys]](propertyKey).
## 0 Reflect.deleteMetadata ( metadataKey, target [, propertyKey] )
When the deleteMetadata function is called with arguments metadataKey, target, and propertyKey, the following steps are taken:

If Type(target) is not Object, throw a TypeError exception.
Return ? target.[[DeleteMetadata]](metadataKey, propertyKey).