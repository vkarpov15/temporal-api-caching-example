import { WorkflowClient } from '@temporalio/client';
import { exchangeRatesWorkflow } from '../workflows';

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function run() {
  const client = new WorkflowClient();

  const handle = await client.start(exchangeRatesWorkflow, {
    taskQueue: 'exchange-rates',
    workflowId: 'exchange-rates-workflow',
  });
  console.log(`Started workflow ${handle.workflowId}`);
}