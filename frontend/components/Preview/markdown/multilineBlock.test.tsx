import MultilineBlock, { BlockCode } from './multilineBlock'

describe('MultilineBlock', () => {
  test('MultilineBlock.find() returns intended result', () => {
    const originalLines: string[] = [
      'line 1',
      '```',
      'line 3',
      'line 4',
      '```',
      'line 6',
      '```',
      'line 8',
    ]
    const expectedResult: (string | MultilineBlock)[] = [
      'line 1',
      new BlockCode([
        'line 3',
        'line 4',
      ]),
      'line 6',
      '```',
      'line 8',
    ]
    const result = MultilineBlock.find(originalLines)
    result.forEach((r, i) => {
      if (typeof r === 'string') {
        expect(r).toBe(expectedResult[i])
      } else {
        expect(r.is(expectedResult[i] as MultilineBlock)).toBe(true)
      }
    })
  })
  test('returns empty array if passed empty array', () => {
    expect(MultilineBlock.find([])).toEqual([])
  })
  test('supports empty block', () => {
    const originalLines: string[] = ['```', '```']
    const expectedResult: (string | MultilineBlock)[] = [new BlockCode([])]
    const result = MultilineBlock.find(originalLines)
    result.forEach((r, i) => {
      if (typeof r === 'string') {
        expect(r).toBe(expectedResult[i])
      } else {
        expect(r.is(expectedResult[i] as MultilineBlock)).toBe(true)
      }
    })
  })
})
