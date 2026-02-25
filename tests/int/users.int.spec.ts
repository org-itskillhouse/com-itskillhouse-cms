import { describe, expect, it } from 'vitest'
import { Users } from '@/collections/Users'

describe('Users beforeValidate hook', () => {
  const hook = Users.hooks?.beforeValidate?.[0]

  it('normalizes numeric id values to strings on update', () => {
    expect(hook).toBeTypeOf('function')

    const result = hook?.({
      operation: 'update',
      data: { id: 1 },
      originalDoc: { id: 1 },
      req: {},
    } as never) as { id?: unknown }

    expect(result.id).toBe('1')
  })

  it('backfills missing id from original document', () => {
    const result = hook?.({
      operation: 'update',
      data: {},
      originalDoc: { id: 42 },
      req: {},
    } as never) as { id?: unknown }

    expect(result.id).toBe('42')
  })
})
