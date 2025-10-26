# CNPJ

Format, validate and generate CNPJ numbers (supports both numeric and alphanumeric formats).

Starting in July 2026, Brazil's Federal Revenue Service will introduce alphanumeric CNPJs for new registrations. This library supports both the traditional numeric format and the new alphanumeric format.

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

### Validation

The library supports both numeric and alphanumeric CNPJ formats:

```js
// Numeric format (traditional)
validate('38.981.218/0001-47'); // true
validate(88415345000157); // true

// Alphanumeric format (available from July 2026)
validate('1A.B23.456/C789-01'); // true
validate('AB.C12.345/6789-01'); // true

// Accepts lowercase by default (normalizes to uppercase)
validate('1a.b23.456/c789-01'); // true

// Strict mode - requires uppercase only
validate('1a.b23.456/c789-01', { strict: true }); // false (has lowercase)
validate('1A.B23.456/C789-01', { strict: true }); // true (all uppercase)
```

### Format

Format any CNPJ string or number into the standard format (XX.XXX.XXX/XXXX-XX):

```js
// Numeric CNPJs
format(88415345000157); // '88.415.345/0001-57'
format('95241373000160'); // '95.241.373/0001-60'

// Alphanumeric CNPJs (normalizes to uppercase)
format('1ab234567c7890'); // '1A.B23.456/7C78-90'
format('ABC123DEF45678'); // 'AB.C12.3DE/F456-78'
```

### Generation

Generate valid CNPJs in either format:

```js
// Generate numeric CNPJ (default for backward compatibility)
generate(); // '12.345.678/0001-95'
generate({ format: 'numeric' }); // '88.415.345/0001-57'

// Generate alphanumeric CNPJ (new format)
generate({ format: 'alphanumeric' }); // '1A.B23.456/C789-01'
```

## API

### `validate(cnpj, options?)`

Validates a CNPJ string or number.

**Parameters:**
- `cnpj` (string | number): The CNPJ to validate
- `options` (object, optional):
  - `strict` (boolean): If `true`, rejects lowercase letters in alphanumeric CNPJs. Default: `false`

**Returns:** `boolean`

### `format(cnpj)`

Formats a CNPJ into the standard format (XX.XXX.XXX/XXXX-XX).

**Parameters:**
- `cnpj` (string | number): The CNPJ to format

**Returns:** `string`

### `generate(options?)`

Generates a valid CNPJ.

**Parameters:**
- `options` (object, optional):
  - `format` ('numeric' | 'alphanumeric'): The format of the generated CNPJ. Default: `'numeric'`

**Returns:** `string`

## CNPJ Format Details

### Numeric Format (Traditional)
- **Structure:** 14 digits
- **Pattern:** `XX.XXX.XXX/XXXX-XX`
- **Example:** `38.981.218/0001-47`
- **Check Digits:** Last 2 positions (calculated using modulo 11)

### Alphanumeric Format (From July 2026)
- **Structure:** 12 alphanumeric characters + 2 numeric check digits
- **Pattern:** `XX.XXX.XXX/XXXX-XX` (where X can be 0-9 or A-Z)
- **Example:** `1A.B23.456/C789-01`
- **Characters:** 0-9 and A-Z (uppercase)
- **Check Digits:** Last 2 positions (numeric only, calculated using modulo 11)

## Backward Compatibility

This library maintains full backward compatibility:
- Existing numeric CNPJs remain valid
- Default behavior unchanged (generates numeric CNPJs)
- All existing code continues to work without modifications

## License

[MIT License](https://gabrielizaias.mit-license.org) &copy; [Gabriel Silva](https://gabe.id)
