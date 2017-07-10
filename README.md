# esp8266-WiFi-communication-with-PC-browser
The purpose of this project is to explore the possibility of dynamic sending/receiving data with esp8266 WiFi module using PC internet browser. 

Files: 

-fillUp.png  Shows control panel in its editing mode. 

-running.png  Shows control panel in its saved mode. Program is running and constantly exchanging data with ESP8266. GPIO 2 and 3 are INPUT pins whereas GPIO 1 is an OUTPUT PIN 
                
- index.html  Contains basic HTML and some CSS

- js3.js  Contains JS code that makes communication and interaction with ESP8266 possible. 

As of this moment the program is hard to use and requires your own Arduino code to run and handle communication on ESP8266. 

JS file contains only basic functions and requires more sophisticated ones. JS code is intentionally open to injections via console to let the user improve the code during operation.

This code is obviously simple and used solutions are far from being perfect. But now it is much more easier to notice flaws in code and future improvements will pop up due to better understanding of what actually is necessary to create control panel for ESP8266 module.
