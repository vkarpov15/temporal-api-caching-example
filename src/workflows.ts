import {
  continueAsNew,
  defineQuery,
  proxyActivities,
  setHandler,
  sleep
} from '@temporalio/workflow';
import { toYYYYMMDD, ExchangeRatesType } from './shared';
import type * as activities from './activities';

const { getExchangeRates } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

const maxNumRates = 30;
const maxIterations = 10000;

export const getExchangeRatesQuery =
  defineQuery<ExchangeRatesType | undefined, [string]>('getExchangeRates');

export async function exchangeRatesWorkflow(storedRatesByDay: Array<[string, ExchangeRatesType]> = []): Promise<void> {
  const ratesByDay = new Map<string, ExchangeRatesType>(storedRatesByDay);
  setHandler(getExchangeRatesQuery, (date: string) => ratesByDay.get(date));

  for (let i = 0; i < maxIterations; ++i) {
    const exchangeRates = await getExchangeRates();
    const today = new Date();
    ratesByDay.set(toYYYYMMDD(today), exchangeRates);
    console.log(toYYYYMMDD(today), exchangeRates);

    const keys = Array.from(ratesByDay.keys());
    if (keys.length > maxNumRates) {
      ratesByDay.delete(keys[0]);
    }

    const tomorrow = new Date(today);
    tomorrow.setHours(12, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    await sleep(tomorrow.valueOf() - today.valueOf());
  }

  await continueAsNew<typeof exchangeRatesWorkflow>(Array.from(ratesByDay.entries()));
}
