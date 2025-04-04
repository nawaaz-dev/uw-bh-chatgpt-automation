export function classPartial(className: string, ...rest: string[]): string {
  return `[class*="${className}"]` + `${rest.length ? ' ' + rest.join(' ') : ''}`;
}
