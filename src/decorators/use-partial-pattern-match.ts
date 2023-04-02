import { PATTERN_EXTRAS_METADATA, PATTERN_METADATA } from '@nestjs/microservices/constants'

import { PartialMatchExtraProp } from '../server'

const getClassMethods = (target: any): ((...args: unknown[]) => unknown)[] => {
  const ret = new Set<(...args: unknown[]) => unknown>()

  function methods(obj: any) {
    if (obj) {
      const ps = Object.getOwnPropertyNames(obj)

      ps.forEach((p) => {
        if (obj[p] instanceof Function && Reflect.hasMetadata(PATTERN_METADATA, obj[p])) {
          ret.add(obj[p])
        }
      })

      methods(Object.getPrototypeOf(obj))
    }
  }

  methods(target.prototype)

  return Array.from(ret)
}

/**
 * Decorator that marks all controller methods decorated with @MessagePattern decorator as eligible for partial match
 * @example The below snippet
 * ```
 * @Controller()
 * class Controller {
 *   @MessagePattern({ foo: 'bar' }, { partialMatch: true })
 *   public method() {}
 * }
 * ```
 * has same effects as
 * ```
 * @Controller()
 * @UsePartialPatternMatch()
 * class Controller {
 *   @MessagePattern({ foo: 'bar' })
 *   public method() {}
 * }
 * ```
 */
export function UsePartialPatternMatch(): ClassDecorator {
  return (target: object) => {
    for (const method of getClassMethods(target)) {
      const extrasMetadata = Reflect.getMetadata(PATTERN_EXTRAS_METADATA, method) ?? {}

      Reflect.defineMetadata(PATTERN_EXTRAS_METADATA, { [PartialMatchExtraProp]: true, ...extrasMetadata }, method)
    }
  }
}
