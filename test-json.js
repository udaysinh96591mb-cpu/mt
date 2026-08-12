const replacer = (key, value) => {
  if (value instanceof HTMLElement) {
    return 'HTMLElement';
  }
  return value;
}
