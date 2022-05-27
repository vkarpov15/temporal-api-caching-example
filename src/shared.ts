// See https://masteringjs.io/tutorials/fundamentals/date-tostring-format-yyyy-mm-dd
export function toYYYYMMDD(date: Date): string {
  return date.toLocaleDateString('en-GB').split('/').reverse().join('');
}

export type ExchangeRatesType = { [key: string]: number };