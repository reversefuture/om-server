// Or: tsx src/demo/test-class-validator.ts
// npx tsc --experimentalDecorators src/demo/test-class-validator.ts
// node src/demo/test-class-validator.js
import { validate, Min, Length } from 'class-validator';

export class User {
  @Min(12, {
    groups: ['registration'], //belong to 1 group
  })
  age: number;

  @Length(2, 20, {
    groups: ['registration', 'admin'], //belong to two groups
    always: true, //always validate this property
  })
  name: string;
}

const user = new User();
user.age = 10;
user.name = 'Alex';

validate(user, {
  groups: ['registration'], // apply registration group rules: age min:12, name length:2-20
}).then(e => {
  console.log(e);
});
//[
//     ValidationError {
//       target: User { age: 10, name: 'Alex' },
//       value: 10,
//       property: 'age',
//       children: [],
//       constraints: { min: 'age must not be less than 12' }
//     }
//   ]

validate(user, {
  groups: ['admin'], // apply admin group: length:2-20
}).then(e => {
  console.log(e); //passed
});

validate(user, {
  groups: ['registration', 'admin'],
}).then(e => {
  console.log(e);
});
//[
//     ValidationError {
//       target: User { age: 10, name: 'Alex' },
//       value: 10,
//       property: 'age',
//       children: [],
//       constraints: { min: 'age must not be less than 12' }
//     }
//   ]

validate(user, {
  groups: undefined, // the default: all goups are applied
}).then(e => {
  // this will not pass validation since all properties get validated regardless of their groups
  console.log(e);
});
//[
//     ValidationError {
//       target: User { age: 10, name: 'Alex' },
//       value: 10,
//       property: 'age',
//       children: [],
//       constraints: { min: 'age must not be less than 12' }
//     }
//   ]

validate(user, {
  groups: [], // the default: all goups are applied
}); // this will not pass validation, (equivalent to 'groups: undefined', see above)
