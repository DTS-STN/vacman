import * as React from 'react';

/**
 * Adapted from radix-ui primitives.
 * https://github.com/radix-ui/primitives/blob/main/packages/react/compose-refs/src/compose-refs.tsx
 */
type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    return ref(value);
  } else if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}

/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 */
function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    const result = refs.reduce(
      (result, ref) => {
        const cleanup = setRef(ref, node);
        if (!result.hasCleanup && typeof cleanup === 'function') {
          result.hasCleanup = true;
        }
        result.cleanups.push(cleanup);
        return result;
      },
      { cleanups: [] as unknown[], hasCleanup: false },
    );

    if (result.hasCleanup) {
      return () => {
        for (let i = 0; i < result.cleanups.length; i++) {
          const cleanup = result.cleanups[i];
          if (typeof cleanup === 'function') {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}

/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return React.useCallback(composeRefs(...refs), refs);
}

export { composeRefs, useComposedRefs };
