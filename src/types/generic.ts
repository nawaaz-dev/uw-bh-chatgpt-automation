export type ErrorReturn<T> = {
  error: string | null;
  data: T | null;
};
