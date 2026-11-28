import { createContext, type ReactNode } from 'react';

/**
 * Provider-level reduce-motion override. `undefined` means "follow the
 * platform setting"; `true`/`false` force the value for a subtree.
 */
export const ReduceMotionOverrideContext = createContext<boolean | undefined>(undefined);

export function ReduceMotionOverrideProvider({
  value,
  children,
}: {
  value?: boolean;
  children?: ReactNode;
}) {
  return (
    <ReduceMotionOverrideContext.Provider value={value}>
      {children}
    </ReduceMotionOverrideContext.Provider>
  );
}
