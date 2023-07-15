export const debounce = (func: () => void, timeout: number = 300) => {
  let timer: number;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this) }, timeout);
  };
}
