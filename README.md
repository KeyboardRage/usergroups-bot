![image](https://github.com/KeyboardRage/usergroups-bot/assets/40437596/ac8b266c-b247-4988-91b3-b9119d9a088f)
# Usergroups Bot
A Discord bot that simulates the classical usergroups found in MyBB forums.

> **Note**  
> Discord have long since changed their API and deprecated endpoints. This bot will no longer work with newest version of Discord.

## Features
* Uses Discord's Slash Commands rather than text-based commands
* Each group gets their own Discord Category with at least 1 text channel and voice channel, with ability to create additional channels
* Each group also get their own Discord server role
* Group leader(s) have access to Channel settings in their category
* Custom theme color for the group
* Message Of The Day for members to read
* Has ability for Userbars (*group badge*), with built-in validation and limitations on dimensions/file formats
* Built-in caps/limitations you can configure
  * max groups a single user can own
  * max groups that can exist in a guild
  * max voice and text channels a single group can have
  * max number of leaders a group can have
  * max number of members a group can have
  * name validation, max charchaters, etc.

## About
The bot was never really released in any official capacity. This is because it was made as a test project to get familiar with Discord's slash command system, as well as try to improve the internal code- and service-structuring.  
The global API makes it very easy to access other APIs, and an intuitive way to perform actions, similar to DiscordJS (*the library used to interact with Discord*).
