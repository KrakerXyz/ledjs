
export type Writeable<T> = { -readonly [P in keyof T]: Writeable<T[P]> };