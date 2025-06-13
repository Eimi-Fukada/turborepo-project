export type HeaderGetter = () => Record<string, string>;

let globalHeaderGetter: HeaderGetter = () => ({});

export const setHeaderGetter = (getter: HeaderGetter) => {
  globalHeaderGetter = getter;
};

export const getGlobalHeaders = () => {
  return globalHeaderGetter?.() || {};
};
