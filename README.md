# TellstickNode
Node.js application to control powersockets via the use of Tellstick.


### Requirements
- Node.js v0.12
- Windows: Telldus Center
- Linux: TelldusCore

### Current working features:
- Pause all schedules/timers
- Creating schedules/timers
- Modification to those based on random minutes and weather status
- Trigger time can be either sunrise, sundown or specific time
- Interval limitation to schedule to ensure that it can only be triggered at specific time interval (useful for sunrise/sunset)
- AutoRemote on a per schedule setting to send notifications to a phone when a schedule or timer is triggered.
- Run-Once option on a per schedule, allowing the creation of a schedule that runs only once and then deletes itself.
- Remote - A page that can be accessed without login, only from the local network to only send on/off to a device.
- Watchers - Watch a specific device for statechange.
- Devicegroups - Group a set of devices together for the ability to schedule multiple devices in one schedule or on/off control.

Sensormodifications are not possible at this time since i don't have any sensors or a Tellstick Duo.

### Usage
After start of application, you can access it by going to  
http://127.0.0.1:8888
At first startup you will be promted to create a new user. After that, just login and create schedules.

### Windows Installation:

1. Unpack Zipfile in a folder of your choice.
2. Navigate to the folder and run 'node installer.js'  
3. This will install the required module for running the service and for the application itself.
4. You can then start it by starting the service.

### Linux Installation:  

1. Unpack Zipfile in a folder of your choice.  
2. Navigate to that folder in a terminal  
3. Run 'node installer.js'  
4. This will cause Node NPM to download the modules required by TellstickNode  
5. Now you can start it via 'sudo service tellsticknode start' Note: The program is not set in autostart on your machine yet. Only manual start.  
6. If you want to see output live in the terminal, run the program via 'node TellstickNode.js' from within the folder instead. As this will output everything into the terminal.  
7. To make a service autostart is different depending on the system.  

### Weather/Sun information - Openweathermap.org

In order to use the weather modifications, a APPID needs to be provided in the options. The APPID is available for free for small usages via Openweathermap.org


### Updating the application:

1. Stop the service in either operating system
2. Replace the current files with those from the downloaded zip.  This will not affect your personal settings and schedules as the directory that stores them are no in the repository.
3. Start the service


### Stability of application:
Currently running on a Windows 64-bit. No errors has occured, everything is working fine.  
Also running on a RaspberryPi with Raspbian. No errors there either.
