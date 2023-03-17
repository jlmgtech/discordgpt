require('dotenv').config();
const { get_encoding, encoding_for_model } = require("@dqbd/tiktoken");
const fs = require("fs").promises;
const { Configuration, OpenAIApi } = require("openai");
if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY, check that you have a .env file " +
        "with the key, or that you have set the environment variable.");
}
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const enc = encoding_for_model("text-davinci-003");

function handleError(e) {
    console.trace(e.message);
    //process.exit(1);
}

function tokens(text) {
    return enc.encode(text).length;
}

async function complete(text) {
    try {
        const response = await openai.createCompletion({
            model: "text-davinchi-003",
            input: text,
        });
        return response.data.choices[0].message;
    } catch (e) {
        handleError(e);
    }
}

async function chat(messages) {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages,
        });
        return response.data.choices[0].message;
    } catch (e) {
        handleError(e);
    }
}

async function embed(text) {
    try {
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: text,
        });
        return response.data.data[0].embedding;
    } catch (e) {
        handleError(e);
    }
}

module.exports = {
    complete,
    chat,
    embed,
    tokens,
    VECTORLENGTH: 1536,
};
