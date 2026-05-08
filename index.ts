/**
 * Validates a CNPJ (numeric or alphanumeric)
 * @param cnpj The CNPJ value to be validated
 */
export function validate(cnpj: string | number): boolean {
	// Remove period, slash and dash characters from CNPJ
	const cleaned = cnpj.toString().replace(/[\.\/\-]/g, '')

	if (
		// Must be defined
		!cleaned ||
		// Must have 14 characters
		cleaned.length !== 14 ||
		// First 12 must be digits or uppercase letters; last 2 must be digits
		!/^[A-Z0-9]{12}\d{2}$/.test(cleaned) ||
		// Must not be sequential identical characters (e.g.: 11111111111111, AAAAAAAAAAAAAA, etc)
		/^(.)\1+$/.test(cleaned)
	) {
		return false
	}

	let registration = cleaned.substr(0, 12)
	registration += digit(registration)
	registration += digit(registration)

	return registration.substr(-2) === cleaned.substr(-2)
}

/**
 * Formats a CNPJ value (numeric or alphanumeric)
 * @param cnpj The CNPJ to be formatted
 * @return The formatted CNPJ
 */
export function format(cnpj: string | number): string {
	// Strip only formatting characters (period, slash, dash)
	const stripped = cnpj.toString().replace(/[\.\/\-]/g, '')

	// If it looks like a well-formed alphanumeric CNPJ, format preserving letters
	if (/^[A-Z0-9]{12}\d{2}$/.test(stripped)) {
		return stripped.replace(/^([A-Z0-9]{2})([A-Z0-9]{3})([A-Z0-9]{3})([A-Z0-9]{4})(\d{2})$/, '$1.$2.$3/$4-$5')
	}

	return (
		cnpj
			.toString()
			// Remove non digit characters
			.replace(/[^\d]/g, '')
			// Apply formatting
			.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
	)
}

export interface GenerateOptions {
	/**
	 * The format of the generated CNPJ.
	 * - `"numeric"` (default): 12 digits + 2 numeric verification digits.
	 * - `"alphanumeric"`: 12 alphanumeric characters (uppercase `A`-`Z` and
	 *   digits) + 2 numeric verification digits.
	 */
	format?: 'numeric' | 'alphanumeric'
}

/**
 * Generates a valid CNPJ
 * @param options Optional generation settings
 * @return The generated CNPJ
 */
export function generate(options: GenerateOptions = {}): string {
	const { format: outputFormat = 'numeric' } = options

	const alphabet = outputFormat === 'alphanumeric' ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '0123456789'

	let cnpj = ''
	let i = 12

	while (i--) {
		cnpj += alphabet[Math.floor(Math.random() * alphabet.length)]
	}

	cnpj += digit(cnpj)
	cnpj += digit(cnpj)

	return format(cnpj)
}

function digit(characters: string): number {
	let index = 2

	const sum = [...characters].reverse().reduce((buffer, char) => {
		// Per the alphanumeric CNPJ spec, the value is the ASCII code minus 48.
		// For digits '0'-'9' this equals 0-9 (matching the previous numeric behavior).
		// For uppercase 'A'-'Z' (ASCII 65-90) this yields 17-42.
		buffer += (char.charCodeAt(0) - 48) * index
		index = index === 9 ? 2 : index + 1
		return buffer
	}, 0)

	const mod = sum % 11

	return mod < 2 ? 0 : 11 - mod
}
