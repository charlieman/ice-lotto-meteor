ICE Lotto [![GPL-2.0 license](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
=========

This is a lotto web application for GuildWars 2  
Built on the Meteor platform

Environment
------------
This project should work on Windows, OSX, and Linux

Dependencies
------------
* Meteor 1.3 or higher

Installation
------------
1. Clone the Repository
2. `meteor npm install --save`

Run
------------
1. `meteor run`
2. Visit [http://localhost:3000](http://localhost:3000)

**Notes**

You may need to run meteor with some additional parameters. Below are some commonly used examples. For a full listing, check Meteor's documentation [here](http://docs.meteor.com/commandline.html).

| Argument     | CMD Parameter              |
|--------------|----------------------------|
| API          | `--settings settings.json` |
| Port         | `--port 1234`              |

In order to use the GW2 API to auto-populate the Guild Bank contents as well as the user log entries, you will need a `settings.json` file passed into meteor.

Example `settings.json` file (replace the values with your own information):

```json
{
	"apiKey": "00000000-0000-0000-0000-00000000000000000000-0000-0000-0000-000000000000",
	"guildId": "00000000-0000-0000-0000-000000000000",
	"inventory": "Bank Section Name"
}
```
