# Notes_API

A REST API for personal notes, built with Node.js, Express and MySQL. Users sign up and log in, and each user can only see and change their own notes.

## Features

- User signup and login, with passwords hashed using bcrypt
- JWT authentication (tokens expire after 1 hour)
- Full CRUD for notes, stored in MySQL
- Per-user data ownership: each note is linked to its owner through a foreign key, and users can't read, edit or delete each other's notes
- Input validation on signup and note creation
- Secrets kept in environment variables

## Tech stack

Node.js, Express, MySQL (`mysql2`), bcrypt, jsonwebtoken, dotenv

## Setup

1. Clone the repo and install dependencies:
```
   npm install
```
2. Create a `.env` file by copying `.env.example`, then fill in your values:
```
   DBPASSWORD=your_mysql_password
   JWTSECRET=a_long_random_string
```
3. Create the database and tables by running `schema.sql` in MySQL (Workbench or the command line).
4. Start the server:
```
   node index.js
```
   The API runs on `http://localhost:3000`.

The app connects to MySQL on `localhost` as `root`, using the `notesapp` database.

## Endpoints

### Auth

| Method | Route | Body | Description |
| --- | --- | --- | --- |
| POST | `/signup` | `username`, `password` | Create an account |
| POST | `/login` | `username`, `password` | Log in and receive a JWT |

### Notes (require a token)

Send the token in the request header: `Authorization: Bearer <token>`

| Method | Route | Body | Description |
| --- | --- | --- | --- |
| GET | `/notes` | none | List your notes |
| GET | `/notes/:id` | none | Get one of your notes |
| POST | `/notes` | `name`, `description` (optional) | Create a note |
| PUT | `/notes/:id` | `name`, `description` | Update one of your notes |
| DELETE | `/notes/:id` | none | Delete one of your notes |

## Database

Two tables: `users` (unique usernames, hashed passwords) and `notes_table`, where `USER_ID` is a foreign key referencing `users`.