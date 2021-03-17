export const uniqueByKey = <T>(array: T[], key: string): T[] => [
  // @ts-ignore
  ...new Map(array.map((item) => [item[key], item])).values(),
];
