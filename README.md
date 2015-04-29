# TellstickNode
Node.js application to control powersockets via the use of Tellstick.


Requirements
- Node.js v0.12
- Windows: Telldus Center
- Linux: TelldusCore

Todo
- Add 'Action' mode 'Dim'
- - Add a percentage input field.
- Add 'Edit' to schedules
- Add 'Enable/Disable' on Schedules
- Add 'Pause All Schedules'
- Add 'Log' page.
- - - Store log events in an array. Maximum 100 log entries.
- - - - - Log commands sent to devices and at what time this was.
- - - - - Log execution of schedules.
- - - Log is also written to console.log, and therefore to logfile via 'forever'
- - - Page fetches contents from Log array and presents it.
- Move everything user-related to userdata folder.
- - - Excluding any contents from it in Github. (Making it easier when updating the application so that these files can't be overwritten)


Current working features
Single-user support ONLY!

- Create schedule
- - Select days
- - run-once option
- - sunrise, sunset, specific time to trigger the schedule
- - randomize the time with modifiers (weather or just random time +/-)
- - actions available: On, Off
- Remove schedules
- Create timers
- - Select days
- - time to start the timers
- - duration of the timer
- - run-once option
- - actions available: On
- - No modifiers available
- Remove timers
- Force Action 'On' for Timers
- Force randomization/weather to '0' for Timers

Sensormodifications are not possible at this time since i don't have any sensors or a Tellstick Duo.


Windows Installation:

1. Unpack Zipfile in a folder of your choice.
2. Navigate to that folder and run Install.bat (right-click and select 'run as administrator')
3. Now you can start it by running start.bat
4. Start.bat has been added to services, set to autostart at startup.

Linux Installation:

1. Unpack Zipfile in a folder of your choice.
2. Navigate to that folder in a terminal
3. Run 'npm install'
4. This will cause Node NPM to download the modules required by TellstickNode
5. If you have already installed 'forever' and 'forever-service', continue to step X
6. To allow the script to be kept alive, run the following two commands:
7. Run 'sudo npm install -g forever' as this will install the forever module globally. This keeps the program running even if it halts for some reason.
8. Run 'sudo npm install -g forever-service' as this will allow you to create a service for this program.
9. While in the folder where the program is located, run 'sudo forever-service install tellsticknode --script TellstickNode.js' Note: Case-sensitive!
10. Now you can start it via 'sudo service tellsticknode start' Note: The program is not set in autostart on your machine yet. Only manual start.
11. If you want to see output live in the terminal, run the program via 'node TellstickNode.js' from within the folder instead. As this will output everything into the terminal.
12. To make a service autostart is different depending on the system.
