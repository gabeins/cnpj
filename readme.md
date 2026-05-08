# CNPJ

Format, validate and generate CNPJ numbers. Supports both numeric and the alphanumeric formats.

## Installation

### Node

```bash
npm install cnpj
```

or, if you are using jsr

```bash
npx jsr add @brazil/cnpj
```

```ts
import { validate, format, generate } from 'cnpj';
```

### Deno

```bash
deno add @brazil/cnpj
```

```ts
import { validate, format, generate } from '@brazil/cnpj';
```

## Usage

```js
// Validation
const valid = validate('38.981.218/0001-47'); // true
const validAlphanumeric = validate('12.ABC.345/01DE-35'); // true

// Format
const formatted = format(88415345000157); // 88.415.345/0001-57
const formattedAlphanumeric = format('12ABC34501DE35'); // '12.ABC.345/01DE-35'

// Generation
const generated = generate(); // randomly generated, valid CNPJ
const generatedAlphanumeric = generate({ format: 'alphanumeric' }); // randomly generated, valid alphanumeric CNPJ
```

### License

[MIT License](https://gabrielizaias.mit-license.org) &copy; [Gabriel Silva](https://gabe.id)
