# [Sukuwatto](https://sukuwatto.com) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/t-recx/sukuwatto/blob/main/LICENSE)

Sukuwatto is a workout tracker with a strong social component and gamification features. It allows users to create workout plans, track and analyze their physical performance, and connect with one another.

## Project structure

| Name                  | Description                               |
| --------------------- | ----------------------------------------- |
| [Backend](backend/)   | Django WSGI, ASGI and worker applications |
| [Frontend](frontend/) | Angular web application                   |

A complete set up for Sukuwatto assumes a relational database (like postgres), a redis store/message broker and a web server (like nginx) to serve the web application files and reverse proxy a wsgi server serving the rest api and an asgi server handling websockets. At least one worker handling scheduled and/or long running tasks in the background (like sending reset password e-mails) should also be configured.

## Requirements

- A Linux or [Windows with WSL](https://docs.microsoft.com/en-us/windows/wsl/install) system
- [Docker compose](https://docs.docker.com/compose/)

## Configuration

Configuration is done via environment variables.
To configure the entire system create a .env file in the main project directory and set the following variables:

| Name                     | Description                                                                               |        Values        |
| ------------------------ | ----------------------------------------------------------------------------------------- | :------------------: |
| POSTGRES_USER            | PostgreSQL database user name                                                             |                      |
| POSTGRES_DB              | PostgreSQL database name                                                                  |                      |
| POSTGRES_PASSWORD        | PostgreSQL database password                                                              |                      |
| DEBUG                    | Returns additional error information when an exception is raised                          |        1 / 0         |
| SECRET_KEY               | Used to provide cryptographic signing, and should be set to a unique, unpredictable value |                      |
| HOST                     | Website host name                                                                         |                      |
| WEBAPP_NAME              | Web app name, used in e-mail templates                                                    |                      |
| DJANGO_ALLOWED_HOSTS     | A list of strings representing the host/domain names that this site can serve             |                      |
| CORS_ORIGIN_WHITELIST    | A list of origins that are authorized to make cross-site HTTP requests                    |                      |
| CORS_ORIGIN_ALLOW_ALL    | If 1, all origins will be allowed.                                                        |        1 / 0         |
| CHANNELS_BACKEND         | Channel layer storing backend                                                             |                      |
| CHANNELS_HOST            | Storing server host name                                                                  |                      |
| CHANNELS_PORT            | Storing server port                                                                       |                      |
| SECURE_SSL_REDIRECT      | If 1, the security middleware will redirect all non-HTTPS requests to HTTPS               |        1 / 0         |
| CSRF_COOKIE_SECURE       | Whether to use a secure cookie for the CSRF cookie                                        |        1 / 0         |
| CSRF_COOKIE_DOMAIN       | The domain to be used when setting the CSRF cookie                                        |                      |
| CSRF_TRUSTED_ORIGINS     | A list of trusted origins for unsafe requests (e.g. POST)                                 |                      |
| AUTH_COOKIE_SECURE       | Whether to use a secure cookie for the session cookie                                     |        1 / 0         |
| AUTH_COOKIE_SAMESITE     | Whether to set the flag restricting cookie leaks on cross-site requests                   | Lax/Strict/\[Empty\] |
| AUTH_COOKIE_DOMAIN       | The domain to be used when setting the session cookie                                     |                      |
| EMAIL_BACKEND            | The backend to use for sending emails                                                     |                      |
| EMAIL_HOST               | The host to use for sending email                                                         |                      |
| EMAIL_HOST_USER          | Username to use for the SMTP server defined in EMAIL_HOST                                 |                      |
| EMAIL_HOST_PASSWORD      | Password to use for the SMTP server defined in EMAIL_HOST                                 |                      |
| EMAIL_PORT               | The port to use for sending email                                                         |                      |
| EMAIL_USE_SSL            | Whether to use an implicit TLS (secure) connection when talking to the SMTP server        |        1 / 0         |
| DATABASE                 | Database type                                                                             |                      |
| SQL_ENGINE               | SQL engine                                                                                |                      |
| SQL_DATABASE             | Database name                                                                             |                      |
| SQL_HOST                 | The database host                                                                         |                      |
| SQL_PORT                 | The port to use to connect to the database                                                |                      |
| SQL_USER                 | The user to use to connect to the database                                                |                      |
| SQL_PASSWORD             | The password to use to connect to the database                                            |                      |
| HUEY_HOST                | Message broker host name to use with huey workers                                         |                      |
| HUEY_PORT                | The port to use to connect to the message broker that huey workers use                    |                      |
| DRF_RECAPTCHA_SECRET_KEY | Recaptcha secret key, used for user registrations. Leave unset to disable captcha use     |                      |

Check an example configuration file in [.env.development](.env.development).

### Frontend configuration

An additional configuration [environment.prod.ts](frontend/src/environments/environment.prod.ts) file is also expected on the [frontend/src/environments](frontend/src/environments) directory, with the following variables set:

| Name         | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| useSSL       | Specifies whether to use SSL when accessing the API/websockets endpoints |
| recaptchaKey | Same as DRF_RECAPTCHA_SECRET_KEY or null if not used                     |
| host         | Backend host name                                                        |
| port         | Port to use when accessing the backend                                   |

## Running

Inside the project directory run:

    $ docker compose up -d

Open [http://localhost](http://localhost) to access the application.

### First-time configurations:

If it's the first time the project is being ran, do the following configurations:

#### **Migrations**

Update the database schema:

    $ docker compose exec wsgi python manage.py migrate --noinput

#### **Seeding**

Seed the initial data for exercises, muscles, metabolic equivalent tasks, etc:

    $ docker compose exec wsgi python manage.py loaddata muscles exercises mets skills skills_exercises

#### **Configure an admin user account (optional)**

    $ docker compose exec wsgi python manage.py createsuperuser

## Additional notes

Geolocation-based workout tracking uses the [geolocation web api](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API). This feature is only available in secure (HTTPS) contexts, and SSL configuration will be required in order for this feature to work.
