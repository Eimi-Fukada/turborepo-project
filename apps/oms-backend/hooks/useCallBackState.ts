import { useState, useRef, useEffect } from 'react';

export default interface SetState<S> {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  (state: Partial<S>, callback?: (state: S) => void): void;
}

/**
 * 合并对象,如果值相同返回原对象
 *
 * @export
 * @template T
 * @param {T} prevObj
 * @param {Partial<T>} partialObj
 * @returns {T}
 */
export function concatObj<T>(prevObj: T, partialObj: Partial<T>): T {
  let newObj = prevObj;
  for (const key in partialObj) {
    if (Object.prototype.hasOwnProperty.call(newObj, key)) {
      const element = partialObj[key];
      if (newObj[key] !== element) {
        newObj = { ...newObj, [key]: element };
      }
    }
  }
  return newObj;
}

/**
 * 生成一个拥有callback 的useState
 *
 * @export
 * @template T
 * @param {T} defaultState
 * @returns {[T, (state: Partial<T>) => void]}
 */

export function useCallBackState<S>(defaultState: S): [S, SetState<S>] {
  const [state, updateState] = useState(defaultState);
  const callbackList = useRef([] as any[]);

  function setState(partialState: Partial<S>, callback?: (state: S) => void) {
    updateState((prevState) => {
      let newState: any;
      if (
        typeof defaultState === 'object' &&
        defaultState !== null &&
        'constructor' in defaultState
      ) {
        if (defaultState['constructor'] === Object) {
          newState = concatObj(prevState, partialState);
        } else {
          newState = partialState;
        }

        if (callback) {
          callbackList.current.push(() => callback(newState));
        }
        return newState;
      }
    });
  }

  useEffect(() => {
    callbackList.current.forEach((value) => value());
    callbackList.current.splice(0, callbackList.current.length);
  }, [state]);

  return [state, setState];
}
