# remove-use-strict [![Build Status](https://travis-ci.org/azu/remove-use-strict.png?branch=master)](https://travis-ci.org/azu/remove-use-strict)

This node module remove unnecessary `"use strict";` literal.

### Unnecessary `"use strict";` ?

> A Use Strict Directive is an ExpressionStatement in a Directive Prologue whose StringLiteral is either the exact character sequences "use strict" or 'use strict'. A Use Strict Directive may not contain an EscapeSequence or LineContinuation.

> A Directive Prologue is the longest sequence of ExpressionStatement productions occurring as the initial SourceElement productions of a Program or FunctionBody and where each ExpressionStatement in the sequence consists entirely of a StringLiteral token followed a semicolon. The semicolon may appear explicitly or may be inserted by automatic semicolon insertion. A Directive Prologue may be an empty sequence.

via [ECMAScript Language Specification - ECMA-262 Edition 5.1](http://ecma-international.org/ecma-262/5.1/#sec-14.1 "ECMAScript Language Specification - ECMA-262 Edition 5.1")

and [&#34;use strict&#34; - blog.niw.at](http://blog.niw.at/post/26687866336 "&#34;use strict&#34; - blog.niw.at")

This module remove `"use strict";`  which isn't delective prologue.

(also has `force` option)

## Installation

``` sh
npm install remove-use-strict
```

## Usage

``` js
var removeUst = require("../lib/remove-use-strict");
var code = 'var a = 1;\n' +
    '"use strict";\n"use strict";';// unnecessary use strict...
removeUst(code); // => 'var a = 1;'
```

force option : true

``` js
var code = '"use strict";\n' +
    'function a(){ "use strict"; \n var a = "use strict"; }';
removeUst(code, {
    force : true
}) // => 'function a(){  var a = "use strict"; }'
```


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT