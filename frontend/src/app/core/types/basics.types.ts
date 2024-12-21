export type Option<T> = T | null | undefined;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type Primitive = string | number | boolean;

export type ChippedTypeKey<T> = keyof T;