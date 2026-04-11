## Hetzner deployment

This app now supports a standard Node.js deployment on Hetzner.

1. Copy the project to the server.
2. Create `.env.production` from `.env.example`.
3. Set `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`.
4. Set `DATABASE_URL` and `DIRECT_URL` to `postgresql://<user>:<password>@postgres:5432/<db>`.
5. Run `docker compose up -d --build`.
6. Bind the app only on `127.0.0.1:3010` and reverse proxy traffic there from OpenLiteSpeed.
