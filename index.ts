/**
 * CNPJ format type
 */
export type CNPJFormat = 'numeric' | 'alphanumeric'

/**
 * Options for CNPJ validation
 */
export interface ValidateOptions {
	/**
	 * If true, rejects lowercase letters in alphanumeric CNPJs (default: false)
	 */
	strict?: boolean
}

/**
 * Options for CNPJ generation
 */
export interface GenerateOptions {
	/**
	 * The format of the generated CNPJ (default: 'numeric')
	 */
	format?: CNPJFormat
}

/**
 * Validates a CNPJ (supports both numeric and alphanumeric formats)
 * @param cnpj The CNPJ value to be validated
 * @param options Validation options
 * @param options.strict If true, rejects lowercase letters in alphanumeric CNPJs (default: false)
 * @returns true if the CNPJ is valid, false otherwise
 *
 * @example
 * validate('38.981.218/0001-47'); // true (numeric)
 * validate('1A.B23.456/C789-01'); // true (alphanumeric, uppercase)
 * validate('1a.b23.456/c789-01'); // true (accepts lowercase by default)
 * validate('1a.b23.456/c789-01', { strict: true }); // false (strict mode rejects lowercase)
 * validate('1A.B23.456/C789-01', { strict: true }); // true (strict mode, valid uppercase)
 */
export function validate(cnpj: string | number, options?: ValidateOptions): boolean {
	const strict = options?.strict ?? false
	const cnpjString = cnpj.toString()

	// In strict mode, check for lowercase letters
	if (strict && /[a-z]/.test(cnpjString)) {
		return false
	}

	// Remove period, slash and dash characters from CNPJ
	const cleaned = cnpjString.replace(/[\.\/\-]/g, '')

	// Normalize to uppercase for alphanumeric support
	const normalized = cleaned.toUpperCase()

	if (
		// Must be defined
		!normalized ||
		// Must have 14 characters
		normalized.length !== 14 ||
		// Must match pattern: 12 alphanumeric + 2 numeric check digits
		!/^[A-Z0-9]{12}[0-9]{2}$/.test(normalized) ||
		// Must not be sequential digits (only for all-numeric CNPJs)
		/^(\d)\1{13}$/.test(normalized)
	) {
		return false
	}

	let registration = normalized.substr(0, 12)
	registration += digit(registration)
	registration += digit(registration)

	return registration.substr(-2) === normalized.substr(-2)
}

/**
 * Formats a CNPJ value (supports both numeric and alphanumeric formats)
 * @param cnpj The CNPJ to be formatted
 * @return The formatted CNPJ (XX.XXX.XXX/XXXX-XX)
 *
 * @example
 * format(88415345000157);      // '88.415.345/0001-57'
 * format('1ab234567c78901');   // '1A.B23.456/7C78-90'
 */
export function format(cnpj: string | number): string {
	return (
		cnpj
			.toString()
			// Remove formatting characters (dots, slashes, dashes)
			.replace(/[\.\/\-]/g, '')
			// Normalize to uppercase for alphanumeric CNPJs
			.toUpperCase()
			// Remove any invalid characters (keep only alphanumeric)
			.replace(/[^A-Z0-9]/g, '')
			// Apply formatting
			.replace(/^([A-Z0-9]{2})([A-Z0-9]{3})([A-Z0-9]{3})([A-Z0-9]{4})([A-Z0-9]{2})$/, '$1.$2.$3/$4-$5')
	)
}

/**
 * Generates a valid CNPJ
 * @param options Generation options
 * @param options.format The format of the generated CNPJ ('numeric' or 'alphanumeric', default: 'numeric')
 * @return The generated CNPJ
 *
 * @example
 * generate();                           // '12.345.678/0001-95' (numeric, default)
 * generate({ format: 'numeric' });      // '88.415.345/0001-57' (numeric)
 * generate({ format: 'alphanumeric' }); // '1A.B23.456/C789-01' (alphanumeric)
 */
export function generate(options?: GenerateOptions): string {
	const formatType = options?.format ?? 'numeric'
	let cnpj = ''
	let i = 12

	if (formatType === 'alphanumeric') {
		// Alphanumeric: use 0-9 and A-Z (36 possible characters)
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		while (i--) {
			cnpj += chars[Math.floor(Math.random() * chars.length)]
		}
	} else {
		// Numeric: use 0-9 only (default for backward compatibility)
		while (i--) {
			cnpj += Math.floor(Math.random() * 9)
		}
	}

	cnpj += digit(cnpj)
	cnpj += digit(cnpj)

	return format(cnpj)
}

/**
 * Converts a character (0-9, A-Z) to its numeric value for CNPJ calculation
 * @param char The character to convert
 * @returns The numeric value (0-9 for digits, 17-42 for A-Z)
 */
function charToValue(char: string): number {
	const code = char.toUpperCase().charCodeAt(0)
	return code - 48
	// Results: '0'=0, '1'=1, ..., '9'=9, 'A'=17, 'B'=18, ..., 'Z'=42
}

function digit(numbers: string): number {
	let index = 2

	const sum = [...numbers].reverse().reduce((buffer, char) => {
		buffer += charToValue(char) * index
		index = index === 9 ? 2 : index + 1
		return buffer
	}, 0)

	const mod = sum % 11

	return mod < 2 ? 0 : 11 - mod
}
