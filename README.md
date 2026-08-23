# Kanban

Simple open source kanban board application. With MIT License.
Dedicated to manage tasks, with simple features:
* import/export
* drag & drop
* time tracking
* activity history


## Overview  

### Local run - todo
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
  * Ready For Review
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

# TODO
docker
docs

1. add a user table and a foreign key to the task table so that in crud there is a dropdown to select what user is assigned to the task. User table can be really simple. Just an ID name and surname
2. add a input field that would be a dropdown from the user table
3. The id of the task in a simple number that gets iterated.
5. the description should be visiable only partly. Right now it presents all the content of description thus making the task really long. The main view should present only some of thedesciption
6. there is a bug. When adding a due date at a one task it gets propagated to all the tasks in the main view of tasks. In the edit widnow its ok, the due date i the one that is set on the task.
