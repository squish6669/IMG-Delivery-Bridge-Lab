# Cloudflare pilot setup

The repository now contains a GitHub Pages frontend plus a Cloudflare Worker/D1 backend for a shared delivery queue.

## 1. Create the D1 database

In Cloudflare, create a D1 database named `img-delivery-bridge`.

Copy its database ID into `worker/wrangler.toml` in place of `REPLACE_WITH_D1_DATABASE_ID`.

## 2. Apply the schema

Use the SQL in `worker/schema.sql` against the new D1 database.

## 3. Deploy the Worker

Deploy the `worker/` project with Wrangler. The Worker should expose an HTTPS URL similar to:

`https://img-delivery-bridge-api.<account-subdomain>.workers.dev`

## 4. Connect the app

Open the GitHub Pages app, go to Settings, paste the Worker URL into **Shared API URL**, and leave the default Workspace ID unless a different workspace is desired.

The setting is stored only in that browser. Configure the same Worker URL and Workspace ID once on the County PC and once on the County iPhone.

## Pilot security boundary

This is a pilot architecture, not a production County security design. The API currently uses a workspace identifier but no authentication. Use fake/test data until the hosting and security model are approved. Do not place secrets or real County records in this public repository.
