export function debounce(fn: Function, delay: number) {
  let timeoutID: NodeJS.Timeout;

  return function () {
    clearTimeout(timeoutID);

    // @ts-ignore
    const that = this;
    const args = arguments;

    timeoutID = setTimeout(function () {
      fn.apply(that, args);
    }, delay);
  };
}
