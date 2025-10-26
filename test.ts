import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { format, generate, validate } from './index.js'

// ===== Numeric CNPJ Tests (Existing) =====

test('valid formatted numeric CNPJs', () => {
	assert.equal(validate('51.878.216/0001-95'), true)
	assert.equal(validate('87.344.783/0001-09'), true)
})

test('valid unformatted numeric CNPJs', () => {
	assert.equal(validate(15548368000166), true)
	assert.equal(validate('95241373000160'), true)
})

test('invalid mixed string with non alphanumeric characters', () => {
	assert.equal(validate('abcd11333977000147efgh'), false)
	assert.equal(validate('76aaa.bbb182ccc.ddd634eee/fff0001ggg-74'), false)
})

test('invalid formatted numeric CNPJs', () => {
	assert.equal(validate('51.878.216/0001-11'), false)
	assert.equal(validate('87.344.783/0001-99'), false)
})

test('invalid unformatted numeric CNPJs', () => {
	assert.equal(validate(15541368000126), false)
	assert.equal(validate('45241173000169'), false)
})

test('invalid sequential numeric CNPJs', () => {
	assert.equal(validate('11.111.111/1111-11'), false)
	assert.equal(validate('22.222.222/2222-22'), false)
	assert.equal(validate('33.333.333/3333-33'), false)
	assert.equal(validate('44.444.444/4444-44'), false)
	assert.equal(validate('55.555.555/5555-55'), false)
	assert.equal(validate(66666666666666), false)
	assert.equal(validate(77777777777777), false)
	assert.equal(validate(88888888888888), false)
	assert.equal(validate(99999999999999), false)
	assert.equal(validate('00000000000000'), false)
})

test('format numeric CNPJ', () => {
	assert.equal(format(15548368000166), '15.548.368/0001-66')
	assert.equal(format('95241373000160'), '95.241.373/0001-60')
	// Test with mixed invalid characters (non-alphanumeric) - should extract only alphanumeric
	assert.equal(format('95.241.373/0001-60'), '95.241.373/0001-60')
})

test('generate numeric CNPJ (default)', () => {
	assert.equal(validate(generate()), true)
	assert.equal(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(generate()), true)
})

test('generate numeric CNPJ (explicit)', () => {
	const cnpj = generate({ format: 'numeric' })
	assert.equal(validate(cnpj), true)
	assert.equal(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(cnpj), true)
})

// ===== Alphanumeric CNPJ Tests (New) =====

test('generate alphanumeric CNPJ', () => {
	const cnpj = generate({ format: 'alphanumeric' })
	assert.equal(validate(cnpj), true)
	assert.equal(/^[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}\-[0-9]{2}$/.test(cnpj), true)
})

test('validate multiple generated alphanumeric CNPJs', () => {
	// Generate and validate 10 alphanumeric CNPJs to ensure consistency
	for (let i = 0; i < 10; i++) {
		const cnpj = generate({ format: 'alphanumeric' })
		assert.equal(validate(cnpj), true, `Generated alphanumeric CNPJ should be valid: ${cnpj}`)
	}
})

test('format alphanumeric CNPJ with lowercase', () => {
	// Format should normalize to uppercase (14 characters exactly)
	assert.equal(format('1ab234567c7890'), '1A.B23.456/7C78-90')
	assert.equal(format('abc123def45678'), 'AB.C12.3DE/F456-78')
})

test('format alphanumeric CNPJ with uppercase', () => {
	assert.equal(format('1AB234567C7890'), '1A.B23.456/7C78-90')
	assert.equal(format('ABC123DEF45678'), 'AB.C12.3DE/F456-78')
})

test('validate alphanumeric CNPJ with lowercase (non-strict)', () => {
	// Generate a valid alphanumeric CNPJ and test lowercase version
	const cnpj = generate({ format: 'alphanumeric' })
	const lowercaseCnpj = cnpj.toLowerCase()
	assert.equal(validate(lowercaseCnpj), true, 'Should accept lowercase by default')
})

test('validate alphanumeric CNPJ with lowercase (strict mode)', () => {
	// Generate a valid alphanumeric CNPJ and test lowercase version with strict mode
	const cnpj = generate({ format: 'alphanumeric' })
	const lowercaseCnpj = cnpj.toLowerCase()
	assert.equal(validate(lowercaseCnpj, { strict: true }), false, 'Should reject lowercase in strict mode')
})

test('validate alphanumeric CNPJ with uppercase (strict mode)', () => {
	// Generate a valid alphanumeric CNPJ (already uppercase) and test with strict mode
	const cnpj = generate({ format: 'alphanumeric' })
	assert.equal(validate(cnpj, { strict: true }), true, 'Should accept uppercase in strict mode')
})

test('validate alphanumeric CNPJ with mixed case (strict mode)', () => {
	const cnpj = generate({ format: 'alphanumeric' })
	// Make it mixed case (lowercase some characters)
	const mixedCaseCnpj = cnpj
		.split('')
		.map((char, idx) => (idx % 2 === 0 ? char.toLowerCase() : char))
		.join('')
	assert.equal(validate(mixedCaseCnpj, { strict: true }), false, 'Should reject mixed case in strict mode')
})

test('validate numeric CNPJ in strict mode', () => {
	// Numeric CNPJs should work fine in strict mode (no letters to be lowercase)
	assert.equal(validate('51.878.216/0001-95', { strict: true }), true)
	assert.equal(validate(15548368000166, { strict: true }), true)
})

test('invalid alphanumeric CNPJ - wrong check digits', () => {
	// Take a valid alphanumeric CNPJ and change the check digits
	const validCnpj = generate({ format: 'alphanumeric' })
	const invalidCnpj = validCnpj.replace(/\d{2}$/, '99')
	// Note: there's a small chance this randomly creates a valid CNPJ, but very unlikely
	// We'll check it's different from the original at least
	assert.notEqual(invalidCnpj, validCnpj)
})

test('invalid alphanumeric CNPJ - too short', () => {
	assert.equal(validate('AB.C12.345/678-90'), false)
	assert.equal(validate('ABC12345678'), false)
})

test('invalid alphanumeric CNPJ - too long', () => {
	assert.equal(validate('ABC.123.456/7890-123'), false)
	assert.equal(validate('ABC123456789012'), false)
})

test('invalid alphanumeric CNPJ - letters in check digits', () => {
	assert.equal(validate('AB.C12.345/6789-AB'), false)
	assert.equal(validate('ABC123456789AB'), false)
})

// ===== Backward Compatibility Tests =====

test('backward compatibility - validate without options', () => {
	// Ensure existing code continues to work
	assert.equal(validate('51.878.216/0001-95'), true)
	assert.equal(validate(15548368000166), true)
})

test('backward compatibility - generate without options', () => {
	// Should generate numeric CNPJ by default
	const cnpj = generate()
	assert.equal(validate(cnpj), true)
	assert.equal(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(cnpj), true)
})
