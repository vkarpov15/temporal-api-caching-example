import axios from 'axios';

export async function getExchangeRates(): Promise<any> {
  const res = await axios.get('https://cdn.moneyconvert.net/api/latest.json');
  return res.data.rates;
};
