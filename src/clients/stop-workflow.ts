import { WorkflowClient } from '@temporalio/client';

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function run() {
  const client = new WorkflowClient();

  const handle2 = client.getHandle('exchange-rates-workflow');
  await handle2.terminate();

  console.log('Workflow terminated');
}