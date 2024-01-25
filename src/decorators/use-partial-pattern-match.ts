import { PATTERN_EXTRAS_METADATA, PATTERN_METADATA } from '@nestjs/microservices/constants'

import { PartialMatchExtraProp } from '../server'

const getClassMethods = (target: unknown): ((...args: unknown[]) => unknown)[] => {
  const ret = new Set<(...args: unknown[]) => unknown>()

  function methods(obj: unknown) {
    if (obj !== null && typeof obj === 'object') {
      const ps = Object.getOwnPropertyNames(obj)

      ps.forEach((p) => {
        const value = Reflect.get(obj, p)

        if (value instanceof Function && Reflect.hasMetadata(PATTERN_METADATA, value)) {
          ret.add(value)
        }
      })

      methods(Object.getPrototypeOf(obj))
    }
  }

  if (target !== null && typeof target === 'function' && 'prototype' in target) {
    methods(target.prototype)
  }

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
