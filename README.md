# TellstickNode
Node.js application to control powersockets via the use of Tellstick.


### Requirements
- Node.js v0.12
- Windows: Telldus Center
- Linux: TelldusCore

### Current working features:
Single-user support ONLY!

Pause all schedules/timers

- Create schedule
 - Select days
 - run-once option
 - sunrise, sunset, specific time to trigger the schedule
 - randomize the time with modifiers (weather or just random time +/-)
 - actions available: On, Off
- Remove schedules
- Create timers
 - Select days
 - time to start the timers
 - duration of the timer
 - run-once option
 - actions available: On
 - No modifiers available
- Remove timers
- Force Action 'On' for Timers
- Force randomization/weather to '0' for Timers

Sensormodifications are not possible at this time since i don't have any sensors or a Tellstick Duo.

### Windows Installation:

1. Unpack Zipfile in a folder of your choice.
2. Navigate to the folder and run 'node WindowsInstaller.js'  
3. This will install the required module for running the service and for the application itself.
4. You can then start it by starting the service.

### Linux Installation:  

1. Unpack Zipfile in a folder of your choice.  
2. Navigate to that folder in a terminal  
3. Run 'node LinuxInstaller.js'  
4. This will cause Node NPM to download the modules required by TellstickNode  
5. Now you can start it via 'sudo service tellsticknode start' Note: The program is not set in autostart on your machine yet. Only manual start.  
6. If you want to see output live in the terminal, run the program via 'node TellstickNode.js' from within the folder instead. As this will output everything into the terminal.  
7. To make a service autostart is different depending on the system.  
