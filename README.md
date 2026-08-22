# Kanban

Simple open source kanban board application. With MIT License.
Dedicated to manage tasks, with simple features:
* import/export
* drag & drop
* time tracking
* activity history


## Overview  

### Local run
```bash
# to install all needed libraries
npm install

# to start the app locally
npm start
```


### Contenerized 
```bash
# run as docker container 
```


### Persistent Storage - PostgreSQL
- Automatically saves:
  - Tasks
  - Activity history
  - Timer progress


### Time Tracking
- Built-in timer per task
- Start/Pause controls directly inside cards
- Automatic timer pause when task moves to:
  * On Hold
  * Done
- Detailed time logs including:
  * Start time
  * End time
  * Session duration
  * Total tracked time


### Activity History Log
- Color-coded status indicators for clarity
- Records every action:
    * Task creation
    * Task movement
    * Deletion
    * Timer events


### Export / Import
- Export full board data as JSON
- Import saved board instantly

