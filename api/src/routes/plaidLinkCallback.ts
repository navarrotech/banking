
import type { Request, Response } from "express"

export async function plaidLinkCallback(request: Request, response: Response) {
  response.status(200).send(`
    <!doctype html>
    <html>
      <head>
        <title>Authorizing...</title>
    
        <meta content="utf-8" http-equiv="encoding">
        <meta name="viewport" content="initial-scale=1">
        <meta content="text/html;charset=utf-8" http-equiv="Content-Type">

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
              token: localStorage.getItem('plaid-link-token'),
              receivedRedirectUri: window.location.href,
              onSuccess: function (public_token) {
                $.post(
                  "/from-public-token",
                  { public_token },
                  function (data) {
                    results.innerHTML = 'You can close this now: ' + data;
                  }
                );
              },
            });
            handler.open();
          })(jQuery);
        </script>
      </body>
    </html>
  `)
}