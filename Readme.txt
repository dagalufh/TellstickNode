Requirements
- Node.js v0.12
- Windows: Telldus Center
- Linux: TelldusCore

Installation
Note: On Linux, run all commands as sudo!


Place the zip file where you want TellstickNode to be.
Inside the TellstickNode folder, run the command: npm install
- This will cause it to install the dependencies.

Install Forever:
npm install -g forever
Note: On Linux, install it as root as this allows you to run it from start.
sudo npm install -g forever


Usage (inside the folder)
For single run on Windows:
node TellstickNode.js
For single run on Linux:
nodejs Tellsticknode.js

For continious running: (while in the directory you unzipped the application)
forever start TellstickNode.js

To have it start on boot:
On Windows, Create a shortcut to TellstickNode.bat in your startup folder

On Linux:
-You might need to do this before:
	sudo ln -s /usr/bin/nodejs /usr/local/bin/node

sudo npm install -g forever-service

# Go to the TellstickNode folder
sudo forever-service install TellstickNode --script TellstickNode.js


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
3.1 Start.bat has been added to services, set to autostart at startup.

Linux Installation:
1. Unpack Zipfile in a folder of your choice.
2. Navigate to that folder in a terminal
3. Run 'npm install'
3.1. This will cause Node NPM to download the modules required by TellstickNode
4. If you have already installed 'forever' and 'forever-service', continue to step X
5. To allow the script to be kept alive, run the following two commands:
5.1. Run 'sudo npm install -g forever' as this will install the forever module globally. This keeps the program running even if it halts for some reason.
5.2. Run 'sudo npm install -g forever-service' as this will allow you to create a service for this program.
6. While in the folder where the program is located, run 'sudo forever-service install tellsticknode --script TellstickNode.js' Note: Case-sensitive!
7. Now you can start it via 'sudo service tellsticknode start' Note: The program is not set in autostart on your machine yet. Only manual start.
7.1. If you want to see output live in the terminal, run the program via 'node TellstickNode.js' from within the folder instead. As this will output everything into the terminal.
8. To make a service autostart is different depending on the system.