import { expect, test } from 'vitest'
test('test common matcher', () => {
    const name = 'tieniu'
    expect(name).toBe('tieniu')
    expect(2+ 2).toBe(4)
})