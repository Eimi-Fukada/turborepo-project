import { useState, useRef } from "react";

/**
 * 超级锁钩子。未运行完毕锁。n毫秒运行一次锁。运行成功n毫秒后才能运行锁。
 *
 * @param setLoading
 * @param fun
 */
export function useSuperLock<T extends (...args: any) => Promise<unknown>>(
  this: any,
  fun: T,
  delay = 100
): [(...args: Parameters<T>) => ReturnType<T> | Promise<void>, boolean] {
  const [lock, setLock] = useState(false);
  const lastDate = useRef<Date>(null);

  return [
    async (...args: Parameters<T>) => {
      if (lock) {
        return;
      }

      const nowDate = new Date();
      if (
        lastDate.current &&
        nowDate.getTime() - lastDate.current.getTime() <= delay
      ) {
        return;
      }

      lastDate.current = nowDate;
      setLock(true);

      let returnValue: any;
      try {
        returnValue = await fun.apply(this, args);
      } catch (error) {
        setLock(false);
        throw error;
      }

      setTimeout(() => {
        setLock(false);
      }, delay);

      return returnValue;
    },
    lock,
  ];
}
