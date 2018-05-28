
//Dependencies
const Discord = require('discord.js');
const fs = require('fs');
const config = require("../joinedAtBot/config.json");

//The Bot
const bot = new Discord.Client();

var owner;
var myGuild;
var allowedRoles = [];

String.prototype.width = function (space, spaceFirst = false, spacingChar = " ")
{
	var arrL = space - this.length + 1;

	if (arrL < 1)	arrL = 1;

	if (spaceFirst) return Array(arrL).join(spacingChar) + this;
	else 						return this + Array(arrL).join(spacingChar);
}

//Stuff starts to happen after the 'ready' event is sent, so code is put here. Kinda like a constructor or main function.
bot.on("ready", () =>
{
	myGuild = bot.guilds.get(config.myGuildID);

	if (myGuild == null)
	{
		console.log("Something went wrong; cannot find myGuild.");
		return;
	}

	myGuild.fetchMember(config.ownerID).then(function(member)
	{
		if (member == null)
		{
			console.log("Something went wrong; cannot find the owner of the guild.");
			return;
		}

		owner = member;

		config.allowedRoles.forEach(function(roleID)
		{
			var role = myGuild.roles.get(roleID);

			if (role == null)
			{
				console.log("Something went wrong; cannot find the role object with id " + roleID + " in this guild.");
			}

			else allowedRoles.push(role);
		});

		console.log("I am ready!");
		//owner.send("I am ready!").catch((err) => {console.log(err);});
	});
});

//On messages sent to channels
bot.on('message', message =>
{
	myGuild.fetchMember(message.author).then(function(member)
	{
		processMessage(message, member);
	});
});

//only triggers on messages sent after the bot was started
bot.on("messageDelete", message =>
{
	myGuild.fetchMember(message.author).then(function(member)
	{
		processDeletedMessage(message, member);
	});
});

function processDeletedMessage(message, authorMember)
{

}

function processMessage(message, member)
{
	var input = message.content;
	var username = message.author.username;

	if (message.author.bot === true)
	{
		return;
	}

	if (member == null)
	{
		console.log("Could not find the GuildMember object of user " + username + ". His input was '" + input + "' in channel " + message.channel.name + ".");
	}

	if (/^%JOINEDAT$/ig.test(input) === true)
	{
		var arr = [];
		var response = "";

		if (checkPermissions(member) === false)
		{
			console.log(`${username} tried to use the command %joinedAt but does not have enough permissions.`);
			return;
		}

		myGuild.fetchMembers().then(function(result)
		{
			for (var [key, value] of result.members)
			{
				arr.push(value);
			}

			arr.sort(function (memberA, memberB)
			{
				return memberB.joinedAt.getTime() - memberA.joinedAt.getTime();
			});

			arr.forEach(function(orderedMember, index)
			{
				response += (orderedMember.user.username + " ").width(30) + " " + orderedMember.joinedAt + "\n";

				if (index % 15 === 0 && index > 0)
				{
					message.author.send(response, {code: true});
					response = "";
				}
			});

			message.author.send(response, {code: true});
		});
	}
}

function checkPermissions(member)
{
	if (member.id === owner.id || )
	{
		return true;
	}

	allowedRoles.forEach(function(role)
	{
		if (member.highestRole.position >= role.position)
		{
			return true;
		}
	});

	return false;
}


//Login to the server, always goes at the end of the document, don't ask me why
bot.login(config.token);


bot.on("disconnect", () =>
{
	console.log("I have been disconnected!");
});

bot.on("reconnecting", () =>
{
	console.log("Trying to reconnect...");
});

bot.on("debug", info =>
{
	//console.log("DEBUG: " + info);
});

bot.on("warn", warning =>
{
	console.log("WARN: " + warning);
});

bot.on("error", () =>
{
	console.log("An error occurred. This is from the 'on.error' event.");
});

//This simple piece of code catches those pesky unhelpful errors and gives you the line number that caused it!
process.on("unhandledRejection", err =>
{
  console.log("Uncaught Promise Error: \n" + err.stack);
});
