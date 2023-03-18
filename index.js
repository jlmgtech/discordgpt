require("dotenv").config();
const fs = require("fs").promises;
const AsyncQueue = require("./lib/AsyncQueue.js");
const { Client, GatewayIntentBits } = require('discord.js');
const gpt = require("./lib/gpt.js");
const queue = new AsyncQueue();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
client.on("messageCreate", (message) => {
    if (message.author.bot) {
        return;
    }
    console.log("message recvd: ", message.content);
    if (message.content.toLowerCase().startsWith("gupta")) {
        queue.push(message);
    }
});
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    process.on("exit", () => {
        console.log("exiting");
        client.destroy();
    });
    main();
});

client.login(process.env.DISCORD_BOT_TOK);

const history = [];
async function main() {
    for (;;) {
        const message = await queue.next();
        const author = message.author.username;
        history.push({
            role: "user",
            content: `${author} said: ${message.content}`,
        });
        const response = await gpt.chat([
            {
                role: "system",
                content: process.env.GPT_PROMPT,
            },
            ...history.slice(-30)
        ]);
        history.push(response);
        message.reply(response.content);
    }
}
