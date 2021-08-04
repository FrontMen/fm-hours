export const uniqueByKey = <T>(array: T[], key: string): T[] => [
  // @ts-ignore
  ...new Map(array.map((item) => [item[key], item])).values(),
];

export const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Remove accents from strings
export const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036F]/g, '');

// Return if a target string is or isn't a match for a seach (query) value
export const queryOnString = (target: string, query: string) =>
  normalizeText(target)
    .toUpperCase()
    .includes(normalizeText(query).toUpperCase());

export function debounce(func: any, timeout = 300) {
  let timer: any;
  return function (...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      // @ts-ignore
      func.apply(this, args);
    }, timeout);
  };
}

export const sortByProp = <T>(
  a: T,
  b: T,
  prop: string,
  order: 'asc' | 'desc' = 'asc'
): number => {
  // @ts-ignore
  if (a[prop] > b[prop]) return order === 'asc' ? 1 : -1;
  // @ts-ignore
  if (a[prop] < b[prop]) return order === 'asc' ? -1 : 1;
  return 0;
};

export const getTotalsByProp = <Type>(
  arrToReduce: Type[],
  prop: keyof Type
): number => {
  return arrToReduce.reduce((total, currentRecord) => {
    const currentValue = currentRecord[prop] || 0;
    return (total += +currentValue);
  }, 0);
};

export function uuidv4() {
  return '00-0-4-1-000'.replace(/[^-]/g, (s: any) =>
    (((Math.random() + ~~s) * 0x10000) >> s).toString(16).padStart(4, '0')
  );
}
