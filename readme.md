# remove-use-strict [![Build Status](https://travis-ci.org/azu/remove-use-strict.svg?branch=master)](https://travis-ci.org/azu/remove-use-strict)

This node module removes unnecessary `"use strict";` literals from JavaScript code.

## Unnecessary `"use strict";` ?

> A Use Strict Directive is an ExpressionStatement in a Directive Prologue whose StringLiteral is either the exact character sequences "use strict" or 'use strict'. A Use Strict Directive may not contain an EscapeSequence or LineContinuation.

> A Directive Prologue is the longest sequence of ExpressionStatement productions occurring as the initial SourceElement productions of a Program or FunctionBody and where each ExpressionStatement in the sequence consists entirely of a StringLiteral token followed a semicolon. The semicolon may appear explicitly or may be inserted by automatic semicolon insertion. A Directive Prologue may be an empty sequence.

via [ECMAScript Language Specification - ECMA-262 Edition 5.1](http://ecma-international.org/ecma-262/5.1/#sec-14.1 "ECMAScript Language Specification - ECMA-262 Edition 5.1")

and [&#34;use strict&#34; - blog.niw.at](http://blog.niw.at/post/26687866336 "&#34;use strict&#34; - blog.niw.at")

This module removes any instances of `"use strict";` that aren't directive prologues. It also has a `force` option, which will do the removal regardless.

## Installation

``` sh
npm install remove-use-strict
```

If you're using gulp, the equivalent gulp task [azu/gulp-remove-use-strict](https://github.com/azu/gulp-remove-use-strict) may be helpful.

## Usage Examples

``` js
const removeUst = require("remove-use-strict");

let code = `
  var a = 1;
  "use strict";
  "use strict";
`;

removeUst(code);

// Yields:
// var a = 1;
```

### Force option

``` js
const removeUst = require("remove-use-strict");

let code = `
  "use strict";
  function a(){
    "use strict";
    let a = "use strict";
  }
`;

removeUst(code, {
  force : true
});

// Yields:
// function a() {
//   var a = 'use strict';
// }
```


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
