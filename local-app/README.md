# LocalApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## Reddit API configuration

Create a Reddit API app that supports the client-credentials OAuth flow. Copy `.env.example` to `.env` and set its `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`. Keep `.env` private; it is excluded from Git, and the credentials are used only by the local API server.

In PowerShell, copy the example file with:

```powershell
Copy-Item .env.example .env
```

Reddit posts load through the local server and refresh every five minutes. Reddit may not expose a public view count for every post, so the page only shows views when the API includes that value.

## Contact form email delivery

The contact form sends messages through Gmail SMTP to `timschweizer.ch@gmail.com`. Set `SMTP_USER` to the Gmail account used to send and `SMTP_APP_PASSWORD` to an app password for that account in `.env`. Create an app password in your Google Account after enabling 2-Step Verification. Do not use your regular Gmail password or commit `.env`. Restart `npm start` after changing `.env`.

The form reports success only after Gmail accepts the message. Replies go to the sender's email address.

## GitHub repositories

The portfolio loads the six most recently updated public repositories for `GITHUB_USERNAME` from the unauthenticated GitHub REST API. Set `GITHUB_USERNAME` in `.env` to use another account. Repository data refreshes every five minutes; no GitHub token is required.

## Development server

Run `npm start` to start both the Angular app and its local Reddit/GitHub API server. Open `http://localhost:4200/`. The Angular app reloads when its source files change.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
