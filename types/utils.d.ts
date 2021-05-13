/*
 * If you want to make a property optional, just use it like:
 * type MakePersonInput = Optional<Person, 'nickname'>
 *
 * and if you wanted to make more than one optional as well:
 * type MakePersonInput = Optional<Person, 'hometown' | 'nickname'>
 */
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
