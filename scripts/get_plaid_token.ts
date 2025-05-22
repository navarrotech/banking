// scripts/get_plaid_token.ts

import { getPlaidClient } from '../lib/plaid'

// pull in Plaid types and enums
import {
  Products,
  CountryCode,
} from 'plaid'

// core Node modules for our tiny HTTP server
import type { IncomingMessage, ServerResponse } from 'http'

import express from 'express'
import multer from 'multer'

import https from 'https'
import fs from 'fs'
import { URL } from 'url'

// hard-coded for simplicity
const PORT = 3000
const REDIRECT_PATH = '/callback'
const REDIRECT_URI = `https://localhost:${PORT}${REDIRECT_PATH}`

const client = getPlaidClient()

// load SSL cert/key
const sslOptions = {
  key: fs.readFileSync('localhost-key.pem'),
  cert: fs.readFileSync('localhost.pem')
}

console.log(`Listening for OAuth callback on ${REDIRECT_URI}`)

let linkToken = ''

// start our server to catch the OAuth redirect
// const server = https.createServer(sslOptions, async (req: IncomingMessage, res: ServerResponse) => {
const app = express()
const upload = multer()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('trust proxy', true)

app.get(REDIRECT_PATH, async (req: IncomingMessage, res: ServerResponse) => {
  if (!req.url) {
    res.statusCode = 400
    res.end('No URL')
    return
  }
  const url = new URL(req.url, `https://${req.headers.host}`)
  if (url.pathname !== REDIRECT_PATH) {
    res.statusCode = 404
    res.end('Not found')
    return
  }

  console.log({
    searchParams: url.searchParams.toString(),
    // @ts-ignore
    body: req?.body,
    // @ts-ignore
    query: req?.query,
  })

  const stateId = url.searchParams.get('oauth_state_id')
  const publicToken = url.searchParams.get('public_token')
  res.end(`
    <!doctype html>
    <html>
      
      <head>
        <title>Webpage</title>
    
        <meta content="utf-8" http-equiv="encoding">
        <meta name="viewport" content="initial-scale=1">
        <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
    
        <!-- Icon -->
        <link rel="shortcut icon" href="/images" type="image/x-icon">
        <link rel="icon" href="/images" type="image/x-icon">
    
        <!-- JS -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>
        <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
    
      </head>
      <body>
        <div id="results"></div>
        <script>
          results = document.getElementById('results');
          (function ($) {
            var handler = Plaid.create({
              token: '${linkToken}',
              // pass in the received redirect URI, which contains an OAuth state ID parameter that is required to
              // re-initialize Link
              receivedRedirectUri: window.location.href,
              onSuccess: function (public_token) {
                $.post(
                  "/api/set_access_token",
                  { public_token: public_token },
                  function (data) {
                    console.log({ data });
                    results.innerHTML = '<h1>Login successful! Data: ' + JSON.stringify(data) + '</h1><p>Return to your console.</p>';
                  }
                );
              },
            });
            handler.open();
          })(jQuery);
          results.innerHTML = '<h1>Loading Plaid Link...</h1>';
        </script>
      </body>
    </html>
  `)

  // if (publicToken) {
  //   // 🔄 second redirect: we finally have the public_token
  //   try {
  //     const exch = await client.itemPublicTokenExchange({
  //       public_token: publicToken
  //     })
  //     res.writeHead(200, { 'Content-Type': 'text/html' })
  //     res.end('<h1>Login successful!</h1><p>Return to your console.</p>')
  //     console.log('\nLogin successful, token:')
  //     console.log(exch.data.access_token)
  //   } catch (err) {
  //     console.error('Exchange error:', err)
  //     res.writeHead(500).end('Exchange error')
  //   } finally {
  //     server.close()
  //   }

  // } else if (stateId) {
  //   // ↩️ first redirect: resume Link for OAuth
  //   const resumeUri = encodeURIComponent(`${REDIRECT_URI}?oauth_state_id=${stateId}`)
  //   const resumeLink = `https://cdn.plaid.com/link/v2/stable/link.html?token=${linkToken}&receivedRedirectUri=${resumeUri}`
  //   // auto-redirect browser
  //   res.writeHead(302, { Location: resumeLink })
  //   res.end()
  //   console.log('🔄 Resuming OAuth flow — redirecting to:')
  //   console.log(resumeLink)

  // } else {
  //   res.writeHead(400)
  //   res.end('Missing oauth_state_id or public_token')
  // }
})

app.post('/api/set_access_token', upload.none(), async (req, res) => {
  // We should receive the public_token here as form data
  const publicToken = req.body.public_token
  if (!publicToken) {
    console.log({ body: req.body })
    res.status(400).send('Missing public_token')
    return
  }
  console.log('Received public_token:', publicToken)

  try {
    // exchange the public_token for an access_token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: publicToken
    })

    const accessToken: string = exchangeResponse.data.access_token
    console.log('🎉 Login successful, access_token:', accessToken)

    // let the browser know we got it
    res.json({ access_token: accessToken })

    // now shut down your script
    process.exit(0)
  }
  catch (err) {
    console.error('Token exchange error:', err)
    res.status(500).send('Token exchange error')
  }
})

const server = https.createServer(sslOptions, app)

// once we're listening, create the Link token
server.listen(PORT, async () => {
  try {
    const resp = await client
      .linkTokenCreate({
        user: { client_user_id: `2086859783` },
        client_name: 'Alex Navarro',
        products: [
          Products.Transactions,
          // Products.Balance,
        ],
        country_codes: [CountryCode.Us],
        language: 'en',
        redirect_uri: REDIRECT_URI
      })
      .catch((error) => {
        if (error?.response?.data) {
          console.error('Error creating link token:', error.response.data)
        }
        else {
          console.error('Error creating link token:', error)
        }
        process.exit(1)
      })

    linkToken = resp.data.link_token
    const linkUrl = `https://cdn.plaid.com/link/v2/stable/link.html?token=${linkToken}`

    console.log('\nOpen this link to authenticate:')
    console.log(linkUrl)
    console.log(`\nWaiting for OAuth callback at ${REDIRECT_URI} …`)
  } catch (err) {
    console.error('Error creating link token:', err)
    process.exit(1)
  }
})
