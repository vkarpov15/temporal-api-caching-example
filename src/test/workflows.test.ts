import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Runtime, DefaultLogger, Worker } from '@temporalio/worker';
import { WorkflowClient, WorkflowHandle } from '@temporalio/client';
import assert from 'assert';
import axios from 'axios';
import { after, afterEach, before, describe, it } from 'mocha';
import sinon from 'sinon';
import * as activities from '../activities';
import { exchangeRatesWorkflow, getExchangeRatesQuery } from '../workflows';
import { toYYYYMMDD } from '../shared';

const taskQueue = 'test-exchange-rates';

describe('example workflow', function () {
  let client: WorkflowClient;
  let handle: WorkflowHandle;
  let shutdown: () => Promise<void>;
  let execute: () => Promise<WorkflowHandle>;
  let env: TestWorkflowEnvironment;

  this.slow(5000);

  before(async function () {
    this.timeout(10 * 1000);
    // Filter INFO log messages for clearer test output
    Runtime.install({ logger: new DefaultLogger('WARN') });
    env = await TestWorkflowEnvironment.create();
    const worker = await Worker.create({
      connection: env.nativeConnection,
      taskQueue,
      workflowsPath: require.resolve('../workflows'),
      activities,
    });

    const runPromise = worker.run();
    shutdown = async () => {
      worker.shutdown();
      await runPromise;
    };
  });

  beforeEach(async () => {
    client = env.workflowClient;
    await client.getHandle('exchange-rates-workflow').terminate().catch(() => {});

    execute = async () => {
      handle = await client.start(exchangeRatesWorkflow, {
        taskQueue,
        workflowExecutionTimeout: 10_000,
        workflowId: 'exchange-rates-workflow',
      });
      return handle;
    }
  });

  after(async () => {
    await shutdown();

    await env.teardown();
  });

  afterEach(async () => {
    await handle.terminate();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('allows querying the latest exchange rate', async function() {
    this.timeout(10000);

    const waitForHTTPRequest = new Promise<void>(resolve => {
      sinon.stub(axios, 'get').callsFake(() => {
        setImmediate(resolve);
        return Promise.resolve({ data: { rates: { AUD: 1.1 } } });
      });
    });

    const handle = await execute();
    await waitForHTTPRequest;
    const result = await handle.query(getExchangeRatesQuery, toYYYYMMDD(new Date()));
    assert.deepEqual(result, { AUD: 1.1 });

    await handle.cancel();
  });
});