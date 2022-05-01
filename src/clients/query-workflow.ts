import { WorkflowClient } from '@temporalio/client';
import { getExchangeRatesQuery } from '../workflows';
import { toYYYYMMDD } from '../shared';

const date: string = process.argv[2] || toYYYYMMDD(new Date()); 

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function run() {
  const client = new WorkflowClient();

  const handle = client.getHandle('exchange-rates-workflow');
  console.log('Query exchange rates for', date);
  console.log(await handle.query(getExchangeRatesQuery, date));
}