# Svelte 5 Template

An opinionated development template designed to create large-scale business apps quickly and deploy them as a static website, iOS App, Android App, Windows Desktop App, MacOS Desktop App, and Linux Desktop App.

## Features

- Internationalization
  - Multiple languages (English, Spanish, etc.)
  - Dynamic language switching
  - Stores language preference in browser local storage and in the user record in Supabase
- Authentication
  - Uses Supabase's [Auth](https://supabase.com/docs/guides/auth)
  - Email/Password
    - Register & send verification email
    - Sign in
    - Reset password
    - Internationalization for email templates (verification, reset password, etc.)
  - OAuth
    - Google
    - Display Avatar / User Image Thumbnail
  - Automatic account linking based on password (single user account for multiple sign-in methods)
- Data Access Layer
  - Modular, separation of concerns
  - Front end code calls data object layer (i.e. [messageService](./src/lib/services/messageService.svelte.ts))
  - Data object layer calls [backendService](./src/lib/services/backendService.svelte.ts)
  - [backendService](./src/lib/services/backendService.svelte.ts) calls [supabase](./src/lib/services/supabase.ts)
  - Data object layers are responsible for fetching data from Supabase
  - Data object layers use and export Typescript Types for objects stored in postgres tables
  - Types are generated automatically from Supabase (see [generate-types.sh](./generate-types.sh))
- Multi-Tenancy
  - Create multiple organizations
  - Switch between organizations
  - Invite other users to join an organization
    - Assign roles to users
    - Accept/Reject invites
    - Update user roles
  - View list of users in an organization
  - View list of invites in an organization
  - Delete an organization
  - Delete a user from an organization
  - Delete an invite from an organization

### Design Philosophy

- client-side code only
  - reduces complexity
  - eliminates middle tier code for faster development
  - increases scalability (no middle tier bottleneck)
- svelte 5
  - easy development enviroment
  - fast, small, compiled application
  - easy and free to deploy as a static site
- shadcn-svelte
  - great-looking UI
  - flexible
  - large community
- Supabase backend
  - uses Supabase JavaScript Client Library
  - host on free tier / upgrade to scale
- modular, organized code base
  - designed for large-scale, complex business projects
  - authentication
  - data access layer
  - simple, reusable components
- automated deployment
  - static web site
  - mobile apps: ios, android
  - desktop apps: windows, macos, linux

## Tecnologies

**Front End:**

- [Svelte 5](https://svelte.dev/docs/svelte/overview)
- [SvelteKit](https://svelte.dev/docs/kit/introduction)
- [Tailwindcss](https://tailwindcss.com/docs/installation)
- [Shadcn-svelte](https://next.shadcn-svelte.com/docs)
- [Supabase JavaScript Client Library](https://supabase.com/docs/reference/javascript/start)

**Back End:**

- [Supabase](https://supabase.com)
  - Supabase [Database (PostgreSQL)](https://supabase.com/docs/guides/database/overview)
  - Supabase [Auth (Authentication)](https://supabase.com/docs/guides/auth)
  - Supabase [Edge Functions](https://supabase.com/docs/guides/functions)
  - Supabase [Storage](https://supabase.com/docs/guides/storage)
  - Supabase [Realtime](https://supabase.com/docs/guides/realtime)
- [Deno 2.0](https://deno.com/)

**Automation / AI**

- [Cursor](https://www.cursor.com/)
  - `.cursorrules` file included to guide AI-driven development
  - `.cursor-documentation` this is list of documentation links to enter into Cursor
    - Cursor Settings / Features / Docs / Add New Doc
    - Add each documentation link found in `.cursor-documentation`

## Developer Aids

- Global constants such as `__APP_VERSION__` declared in [package.json](/package.json) See: [app.d.ts](./src/app.d.ts)
- [Internationalization](./src/lib/i18n/index.ts)
  - [English](./src/lib/i18n/en.ts)
  - [Spanish](./src/lib/i18n/es.ts)
- App setup script: [setup-apps.sh](./setup-apps.sh)
  - Initializes [Ionic Capacitor](https://capacitorjs.com/docs/getting-started)
  - Sets up ios
  - Sets up android
  - Creates icons (see [make-icons.sh](./make-icons.sh))
  - Copies icons for ios/android (see [update-app-icons.sh](./update-app-icons.sh))
- Icon build system
  - [make-icons.sh](./make-icons.sh) creates all icons from a base icon svg file [icon.svg](./static/icon.svg)
  - [update-app-icons.sh](./update-app-icons.sh) copies icons needed for `ios` and `android` app versions

## Development Targets

- Web Dev: `npm run dev` or `./dev.sh`
- iOS: `npm run ios`
- iOS with instant reload: `npm run ios-reload`
  - requires `npm run dev` server running on port 5172
- Android: `npm run android`
- Android with instant reload `npm run android-reload`
  - requires `npm run dev` server running on port 5172

## Deploy Targets

- Static Web Site: `npm run build`
- iOS: `npm run ios`
- Android `npm run android`
- Desktop Releases:
  - Push to `release` branch
    - `git checkout -B release`
    - `git merge main`
    - `git push`
  - This will trigger Github Actions (`./.github/*.yaml`) to automatically build with the following releases with Tauri:
    - MacOS Intel (x86_64)
    - MacOS Apple Silicon (ARM)
    - Windows x86_64
    - Windows ARM
    - Ubuntu/Linux x86_64
    - Ubuntu/Linux ARM

# Setup / Quickstart

## Set Up Supabase Project

- make sure the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) is installed
- create a new Supabase project at (https://supabase.com)
- go to the Supabase dashboard [SQL Editor](https://supabase.com/dashboard/project/_/sql)
  - execute the contents of[public-schema.sql](./data/schema.sql) to create the public database schema
  - execute the contents of [auth-schema.sql](./data/auth-schema.sql) to create the auth schema trigger on the users table
  - execute the contents of [storage-schema.sql](./data/storage-schema.sql) to create the property-images bucket

## Set Up Keys

- Server URL and ANON_KEY are encrypted (for obfuscation)
  - `cp .keys.json.sample .keys.json`
  - locate your Supabase URL and ANON KEY in the Supabase Dashboard [API Settings](https://supabase.com/dashboard/project/_/settings/api)
  - enter your URL and ANON_KEY in `.keys.json`
  - make sure **Deno 2.0** is installed See: [Deno 2.0](https://deno.com/)
  - run: `./lock-up-keys.sh` _OR_ `deno run --allow-read --allow-write lock-up-keys.deno.ts`
- Copy keys to Github Secrets (necessary to run Github Actions to create Desktop versions with Tauri)
  - make sure `gh` [Github Command Line](https://github.com/cli/cli?tab=readme-ov-file#installation) is installed
  - run `gh auth login` (if not already logged in)
  - run `gh secret set -f .env`

## Set up Supabase Edge Functions

- make sure the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) is installed
- run: `supabase init` from the root of your project
  - a file `supabase/config.toml` will be created
  - by default this file is excluded from source control
  - you can add it to source control by commenting it out in `supabase/.gitignore` (though this is not recommended)
- run: `supabase link` from the root of your project
- setup keys
  - create the `.env` file: `cp supabase/.env-sample supabase/.env`
  - set your keys in the `supabase/.env` file:
    - `SEND_EMAIL_HOOK_SECRET=your_hook_secret`
      - Set up auth hook here: [Supabase Auth Hooks](https://supabase.com/dashboard/project/_/auth/hooks)
      - Set up auth hook for your edge function: send-email **TODO**
    - `MAILGUN_API_KEY=your_mailgun_api_key`
      - [Mailgun](https://www.mailgun.com/)
    - `MAILGUN_DOMAIN=your_mailgun_domain`
      - [Mailgun](https://www.mailgun.com/)
    - `GEOAPIFY_API_KEY=your_geoapify_api_key`
      - [Geoapify](https://www.geoapify.com/)

### Set up Supabase Auth

- Go to the Supabase dashboard [Auth Settings](https://supabase.com/dashboard/project/_/settings/auth)
  - Under **SMTP Setting**
    - Turn **Enable Custom SMTP** ON
    - Set **SMTP Host** to `smtp.mailgun.org`
    - Set **SMTP Port** to `587`
    - Enter your Sender Details, Username and Password from Mailgun
- Set up Google OAuth
  - Set up your [Google Provider](https://supabase.com/docs/guides/auth/social-login/auth-google)
    - (You will obtain your Client ID and Client Secret from the Google Developer Console)
  - Go to the Supabase Dashboard [Auth Providers](https://supabase.com/dashboard/project/_/auth/providers)
    - Toggle **Enable Sign in with Google** to ON
    - Enter your Client ID
    - Enter your Client Secret

### Deploy Supabase Edge Functions

- from the root of your project, run:
  - `supabase functions deploy send-email`
  - `supabase functions deploy server_function`

## Utility Scripts

- `dev.sh`: run the local development server and open in browser
- `deploy-cloudflare.sh`: build and deploy to Cloudflare Pages
- `dump_schema.sh`: dump the database schema from Supabase to `./data/schema.sql`
- `fix_macos_app.sh`: to run a downloaded MacOS app version that's unsigned, run `fix_macos_app.sh <app-name>` such as `fix_macos_app.sh svelte5-template_macos.app`. This runs `xattr -cr svelte5-template_macos.app` to enable the app to be run even though it's not signed.
- `generate-types.sh`: generate typescript types from Supabase to `./src/lib/types/database.types.ts`
- `lock-up-keys.sh`: encrypt keys in `.keys.json` and write them to encrypted values in `.env`
- `make-icons.sh`: generate all app icons from the original icon svg in `./static/icon.svg`
- `setup-apps.sh`: initialize Capacitor apps for iOS and Android and create all app icons
- `shadcn-add-component.sh`: add a new component from the shadcn-svelte library into the project
- `update-app-icons.sh`: copy all app icons for iOS and Android
