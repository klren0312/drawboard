export interface DebounceAndThrottleOptions {
  // 立即执行
  immediate?: boolean
  // 是否为debounce
  debuonce?: boolean
  // 只执行一次
  once?: boolean
}

export type CancelFn = () => void

export type DebounceAndThrottleProcedure<T extends unknown[]> = (...args: T) => unknown

export type DebounceAndThrottleProcedureResult<T extends unknown[]> = [
  DebounceAndThrottleProcedure<T>,
  CancelFn
]

import {
  useThrottle
} from './useThrottle'

export function useDebounce<T extends unknown[]>(
  handle: DebounceAndThrottleProcedure<T>,
  wait: number,
  options: DebounceAndThrottleOptions = {}
): DebounceAndThrottleProcedureResult<T> {
  return useThrottle(
    handle,
    wait,
    Object.assign(options, {
      debounce: true
    })
  )
}
