# ModelMind

ModelMind brings the personalized learning roadmap, local notebook workspace,
interactive machine-learning visualizations, and VideoGPT into one dashboard.
Roadmap, visualization, and VideoGPT links open in a new tab; the notebook
continues to run in the local ModelMind app.

## Production setup (beginner-friendly)

Account creation verifies an email with a one-time Brevo code, then lets the
user create a password. Passwords are stored in MongoDB only as salted scrypt
hashes and must be 8–128 characters; plain-text passwords and OTPs are never
stored. Sign-in uses the email
and password. If another device already has an active session, the user can
confirm signing it out before continuing. Supabase remains the server-side
identity reference for existing project rows; its service-role key is used
only by server code and must never be exposed to the browser.

### A. Configure Brevo and MongoDB OTP sign-in

1. Create a MongoDB Atlas free cluster, a database user, and a network access
   rule. Prefer restricting access to your deployment's outbound IPs where
   supported; do not leave a database open to the public. Copy the connection
   string into `MONGODB_URI` and set `MONGODB_DB=modelmind`.
2. Create a Brevo account, verify an approved sender address in Brevo, and
   create an API key for transactional email. Set `BREVO_API_KEY` and
   `BREVO_SENDER_EMAIL`. Brevo's free plan has a daily send limit that can
   change; check its current plan and sender-verification requirements. A
   free plan does not guarantee that a sender domain is free.
3. Generate a random secret of at least 32 characters for `OTP_HASH_SECRET`.
   Set the same value in local development and the production server's secret
   environment. Never commit it or paste it into chat.
4. Set `MODELMIND_ADMIN_EMAILS` to a comma-separated list of the email
   addresses allowed to view `/admin/users`. Use the same normalized email
   used to sign in; keep the setting server-only and update the deployment
   environment when adding or removing an administrator.
5. In Supabase **Project Settings → API**, copy the project URL into
   `SUPABASE_URL` and the service-role key into `SUPABASE_SERVICE_ROLE_KEY`.
   This key is required only on the server to map verified email identities
   to existing Supabase user IDs. Do not use a `NEXT_PUBLIC_` variable for it.
6. Copy `.env.local.example` to `.env.local`, fill the values locally, and
   add the same secrets to your hosting provider's server environment before
   deploying. Never commit `.env.local`.
7. Test signup end-to-end. Check the inbox and spam folder, enter the code
   before it expires, create a password, then verify that the user appears in
   MongoDB and Supabase **Authentication → Users**. Email delivery has not
   been tested until this real test succeeds.

The app stores only an HMAC hash of each OTP. Codes expire after 10 minutes,
are single-use, have a five-attempt verification limit, and requests are
rate-limited to five per address per hour, 20 per IP per hour, and 250 total
per rolling 24 hours to leave headroom under Brevo's stated free daily limit.
Verified-email proofs expire after 10 minutes and are single-use. MongoDB's
TTL indexes remove expired challenges, proofs, and sessions asynchronously;
the application also checks expiry itself. Do not log OTPs or passwords.

New users are created after verifying their email and setting a password.
Existing passwordless accounts can set a password by verifying their email.
Existing Supabase users are linked by normalized email, so their project
ownership IDs remain intact. Password hashes use Node.js scrypt with a unique
random salt. A monotonically increasing account session generation invalidates
all other sessions when a user confirms a new-device sign-in; session cookies
are HTTP-only, same-site, and secure in production. Supabase Auth records
remain as server-side identity references for the existing schema.

Administrators in `MODELMIND_ADMIN_EMAILS` can open **User analytics** in the
dashboard sidebar or visit `/admin/users`. The page lists unique email
accounts registered today, the latest recorded login, and the total number
of unique accounts. Statistics are derived from MongoDB's `users` collection,
case-insensitively grouped by email (not from session records), and dates are
shown in UTC. Unauthenticated visitors are sent to sign-in; other signed-in
users cannot view the admin page.

### B. Configure one-time ModelMind payments

1. Create a Razorpay account and use its test-mode API keys first. Set
   `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local` and your hosting
   provider's server-only environment. Never expose the key secret to browser
   code or commit payment credentials.
2. The checkout price is fixed server-side at **₹99 once**; the browser cannot
   change the amount. On successful sign-in, accounts without access are sent
   to `/purchase`. A captured payment grants permanent access, recorded
   against the signed-in MongoDB user.
3. In the Razorpay dashboard, configure a webhook at
   `https://<your-domain>/api/payment/webhook` for the `payment.authorized`
   and `payment.captured` events. Set its webhook secret as
   `RAZORPAY_WEBHOOK_SECRET`. Use the same secret in local test configuration
   when testing webhooks.
4. Test with Razorpay test keys and a test payment. Verify that checkout
   success returns to the dashboard, signing out and back in retains access,
   and accounts without access still see the purchase screen. Configure live
   keys and a live webhook only after those checks pass.

The server validates the Checkout HMAC, fetches the payment from Razorpay,
checks its order, amount, currency, and captured status, and only then records
the entitlement. Webhook signatures are also verified. Razorpay's `payment
captured` event is useful if the browser closes before returning from checkout.
Do not manually create enrollment records to grant access.

For free demos, the purchase page also displays the `MODELMIND108` coupon by
default. Click **Apply** to see the ₹99 discount and ₹0 total, then click
**Get one month free**. The server validates the coupon and records a
zero-rupee entitlement for one calendar month from redemption; Razorpay is not
opened. After expiry, the account is sent back to the purchase page, including
if it is still on the dashboard when the month ends. Redeeming the code again
starts a new one-month demo period.
You can change the code using the server-only `MODELMIND_FREE_COUPON` setting,
or set it to an empty value to disable coupons. This default coupon is public
and grants free access, so disable or change it before charging real users.

### C. Create the database tables safely

1. In the Supabase Dashboard, open **SQL Editor → New query**.
2. Open
   [`supabase/migrations/20261010000000_initial_user_data.sql`](./supabase/migrations/20261010000000_initial_user_data.sql),
   copy its complete contents into the SQL Editor, and run it once on the
   intended Supabase project. Do not run it repeatedly; it creates tables,
   policies, triggers, and a private dataset bucket.
3. In **Database → Tables**, confirm `profiles`, `projects`, and `datasets`
   exist and have Row Level Security enabled. In **Storage**, confirm
   `user-datasets` is private.
4. Test with two accounts before adding real data. A signed-in user must not
   be able to read or change another user's rows or files. Do not disable RLS
   to make a failed request work.

The profile row is created automatically when the server creates the
corresponding Supabase identity after OTP verification. After the migration is
applied, the Projects page can create and list each user's project records in
Supabase, using a server-side ownership check tied to the MongoDB session.
Dataset metadata and a private Storage bucket are provisioned, but dataset
upload is not yet wired to the UI.
Notebook contents remain in the local Jupyter environment and are not
cloud-synced. In this deployment design, the website connects to the user's
local notebook companion; it does not provide a shared hosted notebook
runtime.

### D. Deploy the website

1. Push the project to a Git provider and import it into a Next.js hosting
   service such as Vercel. Set the project root to `modelmind-source`.
2. Configure the website URLs from `.env.local.example` and the server-side
   authentication, database, email, Supabase, and payment variables described
   above in the hosting provider. Mark all server-side credentials as secrets.
3. Deploy, then test code delivery, verification, password creation and
   sign-in, the other-device confirmation, session persistence, logout,
   project creation, and access isolation. Confirm an unauthenticated user
   cannot access `/`.

The Supabase service-role client bypasses RLS, so every project API route must
continue to derive the owner ID from the validated MongoDB session and filter
or insert only that owner's records. Never call the admin client from browser
code. Do not disable RLS.

### E. Keep the notebook runtime on each user's computer

Deploy the Next.js website separately from the Jupyter/Python runtime. Set the
hosting provider's project root to `modelmind-source`, build with
`npm run build`, and use `npm start` to serve only the website. Never start
Jupyter or the Python execution API on the public website host.

The website talks to a local companion on the user's own computer. The
companion starts the Python API on `127.0.0.1:8000` and customized JupyterLab
on `127.0.0.1:8899`. The API checks the browser `Origin` against the exact
deployed website origin in the companion's `MODELMIND_WEB_ORIGINS` setting.
Set it in the local project-root `.env` file, then restart the companion. Do
not use a wildcard or expose either local port publicly.
Notebook code runs as the local user's account, so this local runtime is not a
sandbox for untrusted code.

The dashboard's **Open Notebook** button submits a same-origin-checked request
to the local companion. The companion finds the local Jupyter server metadata
and redirects the browser to its token-authenticated Lab URL; the token is not
sent to the hosted website. Keep Jupyter token/password authentication enabled.
The companion and Jupyter use the same operating-system Jupyter runtime
directory (or the same inherited `JUPYTER_RUNTIME_DIR` override). If the
companion is stopped, the Notebook page explains how to start it.

The current preview companion still requires Node.js, Python, and a checkout
of this project. Signed one-click installers and browser localhost-permission
validation remain follow-up release work.

## Run locally

```bash
npm install
npm run dev
```

`npm run dev` starts the local Python API, customized JupyterLab, and the
development dashboard. JupyterLab opens an authenticated browser session;
keep the terminal running while using ModelMind. To run only the local Python
API and JupyterLab alongside the hosted website, use `npm run companion`.
JupyterLab starts at `http://127.0.0.1:8899`; the API listens at
`http://127.0.0.1:8000`. Set `NEXT_PUBLIC_JUPYTER_URL` or
`MODELMIND_API_PORT` only when you need different local ports. Configure
`MODELMIND_WEB_ORIGINS` in the companion environment to your exact deployed
website origin. For the website, run `npm run build` and then `npm start`;
that production command does not start local services.

## Notebook AI credentials

Choose **API Key** in the dashboard sidebar, then open JupyterLab and select
the **API Key** tab in the right sidebar to save or remove a Gemini key from
the operating system credential store. This personal key takes precedence over
a key supplied by the server environment. The key is not written to browser
storage or notebook files. Ollama remains the local AI option. Review the repository
[README](../README.md) for the notebook setup and Gemini data-sharing
safeguards. Gemini error-fix suggestions also require cloud fallback to be
enabled on the Jupyter server and the **Allow Gemini use** opt-in in Error
Assistant.

When running the local dashboard with `npm run dev`, JupyterLab starts
automatically and opens its authenticated local session. The standalone
platform launcher remains available for JupyterLab setup. If Ollama is
missing, **Get Ollama** opens its official download page; after installing and
starting Ollama, use **Install recommended model** to download the model with
your approval. Never share the tokenized Jupyter URL.
