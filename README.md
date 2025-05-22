# Banking

This is a project that is designed to manage finances for a single person.
It uses the Plaid API, and combines data from CSVs for a full financial picture.

The frontend is designed to use [LCARS](https://www.thelcars.com/) styling, and is designed to do all state management and heavy calculations on the frontend.

The backend is extremely lightweight, it just runs a cron job once a day and hosts an extremely simple database.

# Financial philosophy

This respository is heavily opinionated, as it **strongly** centered around a cashflow mindset. I believe that finances should be calculated on a weekly basis or even daily basis.

Instead of looking at finances as monthly payments or bi-weekly paychecks, everything is calculated down to the simplest level of weekly or daily payments.

### Example:
Sample income and expenses:
Let's suppose that you get paid $1,000 every 2 weeks, and your mortgage is $800 every month.

This tool does **NOT** aid you in month-to-month calculation.

Instead, it looks at calculations on a weekly basis and daily basis.

First, we calculate the annual costs:
$1000 * 26 (pay periods per year) == $26,000 annual
$800 * 12 (mortgage periods per year)  == $9,600 annual

When shown per week, it'll be displayed as:
- $26,000 / 52, **$500** as your base income per week
- $9,600 / 52, **$800** as your expenses per week

Or more granularly, we can look at it per day as:
- $26,000 / 365, **$71.24** as your base income per day
- $9,600 / 365, **$26.31** as your base expenses per day

### Why?

Because cash flow is king, and you need to measure things in cash flow. The more granular your cash flow is, the more control you have over your finances.

Understanding that everyday you're net +$10 is more powerful then seeing you make +$300 per month, it gives you more control and power to your financial landscape.

### Leap year

This tool purposefully does not factor in leap year, as a majority of people's finances don't increase by working an extra day in the year (with salary). Instead, it does the math on 365.25 days, instead of 365 or 366 days.

## Installation:

Create the default .env:

```env
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

DATABASE_URL=postgres
ACCESS_PASSWORD=1234

DOMAIN=https://localhost:3000
PORT=3000

PLAID_CLIENT_ID=bazz
PLAID_SECRET=foo

PLAID_AMEX_ACCESS_TOKEN=bizz
PLAID_ICCU_ACCESS_TOKEN=buzz
```

To install assets, you will need to run the following:
```bash
make setup
```

## Running:

First time run:
```bash
make reup
```

Subsequent runs:
```bash
make up
```

## Important notes

In `NODE_ENV = production` it uses Plaid production mode.
In `NODE_ENV = development` it uses Plaid sandbox mode.

Once running, to get Plaid access tokens, visit:
```
https://<domain>:3000/access-token
```

Remember: Plaid requires us to use one token per account.
Plaid also requires OAuth and https.

## Cron

Every night at midnight MST it will fetch the latest transactions, going back a full year. The free plan of Plaid (when this was written) supports 200 requests per month, so we should be good :)

2 accounts (iccu & amex) times 31 days per cycle = 62 maximum calls, of 200 total.
