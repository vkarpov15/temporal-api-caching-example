import {
  continueAsNew,
  defineQuery,
  proxyActivities,
  setHandler,
  sleep
} from '@temporalio/workflow';
import { toYYYYMMDD } from './shared';
import type * as activities from './activities';

const { getExchangeRates } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

const maxNumRates = 30;
const maxIterations = 10000;

export const getExchangeRatesQuery = defineQuery<any, [string]>('getExchangeRates');

export async function exchangeRatesWorkflow(storedRatesByDay: Array<[string, any]> = []): Promise<any> {
  const ratesByDay = new Map<string, any>(storedRatesByDay);
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
    // @ts-ignore
    await sleep(tomorrow - today);
  }

  await continueAsNew<typeof exchangeRatesWorkflow>(Array.from(ratesByDay.entries()));
}
