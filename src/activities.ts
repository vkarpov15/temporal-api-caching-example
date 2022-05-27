import { ExchangeRatesType } from './shared';
import axios from 'axios';

export async function getExchangeRates(): Promise<ExchangeRatesType> {
  const res = await axios.get('https://cdn.moneyconvert.net/api/latest.json');
  return res.data.rates as ExchangeRatesType;
};
