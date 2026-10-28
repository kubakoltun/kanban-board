# Kanban

A simple open-source Kanban board application for managing tasks and tracking work.
The project is released under the MIT License.


## Features
* Task management using a Kanban board
* Drag & drop task movement
* Task time tracking
* Activity history
* Import/export of board data
* PostgreSQL persistent storage
* User assignment

The project follows a simple frontend/backend architecture. Both parts are maintained in the same repository rather than being split into separate projects.


## Tech Stack
* JavaScript (ES Modules) - application logic and UI behavior
* HTML - static HTML structure and CRUD interface
* CSS - styling and responsive layout
* Vite - frontend development server and production build tool
* ESLint - JavaScript code linting and consistency checks

The frontend code is located in the src/ directory.


## Backend
* JavaScript (Node.js) - backend runtime
* Express - REST API server
* Drizzle ORM - database access and schema management
* PostgreSQL - persistent data storage

The backend code is located in the server/ directory.


## Database
PostgreSQL is used as the application's persistent storage layer.

Drizzle ORM provides:
- Database schema definitions
- Type-safe database queries
- Database migrations
- Database schema synchronization
- Database mock
- Database development tools through Drizzle Studio


## Overview  

### Running Locally
#### Prerequisites
Before running the application, make sure the following are installed:
* Node.js
* npm
* PostgreSQL

The PostgreSQL database must be running before starting the backend.

#### Install dependencies
```bash
# Install the frontend dependencies from the project root:
npm install

# Then install the backend dependencies:
cd server
npm install
cd ..
```

#### Configure the database
Create a PostgreSQL database and configure the backend connection using environment variables.

For example, create:
server/.env
with the required PostgreSQL connection settings.

A typical configuration might look like:
DATABASE_URL=postgresql://username:password@localhost:5432/kanban

The exact environment variables depend on the database configuration used by the backend.

#### Initialize the database
```bash
# From the server/ directory, apply the Drizzle schema:
cd server
npm run db:push

# If the project uses migrations instead, migrations can be generated and applied with:
npm run db:generate
npm run db:migrate

# To populate the database with initial data:
npm run db:mock_user
```

#### Start the application
The frontend and backend are currently separate processes.
```bash
# Start the backend:
cd server
npm run dev

# Then, in another terminal, start the frontend from the project root:
npm run dev
```

The Vite development server will provide the frontend application, while the Express server handles API requests.
For convenience, the frontend npm start command is configured as an alias for:
```bash
npm run dev
```

### Containerization
The project currently contains a Docker image build script:
```bash
./build-docker-image.sh
```
Docker support covers:
* Frontend
* Backend API
* PostgreSQL
* Environment configuration
* Persistent database storage


### Persistent Storage - PostgreSQL
The application uses PostgreSQL for persistent storage.
The database stores information such as:
* Tasks
* Task status and priority
* Assigned users
* Due dates
* Tags
* Subtasks
* Activity history
* Time tracking data
* Timer state

Task data is persisted through the backend API using Drizzle ORM.
This means that restarting the frontend or backend does not remove the stored Kanban data.


### Time Tracking
- Built-in timer per task
- Start/Pause controls directly inside cards
- Automatic timer pause when task moves to:
  * Ready For Review
  * Done
- Detailed time logs including:
  * Start time
  * End time
  * Session duration
  * Total tracked time


### Activity History
The application maintains an activity history log for important task events.
The history records actions such as:
* Task creation
* Task movement between columns
* Task deletion
* Timer events
* Other relevant task changes

The history view provides color-coded status indicators to make different types of activity easier to identify.


### Export / Import
- Export full board data as JSON
- Import saved board
