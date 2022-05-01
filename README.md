# Temporal API Caching Example

### Running this sample

1. Make sure Temporal Server is running locally (see the [quick install guide](https://docs.temporal.io/docs/server/quick-install/)).
1. `npm install` to install dependencies.
1. `npm run start.watch` to start the Worker.
1. In another shell, `npm run start-workflow` to run the Workflow Client
1. Run `npm run query-workflow` to query exchange rates for a given day (today by default)

The Workflow should print out exchange rates for several currencies:

```bash
{
  AED: 3.673005,
  AFN: 86,
  ALL: 114.75,
  AMD: 460.236151,
  ANG: 1.802194,
  ...
}
```
