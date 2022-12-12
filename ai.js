require("dotenv").config(); // call configuration file
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_TOKEN,
});
const openai = new OpenAIApi(configuration);

// this function for delete whitespace before string
function ltrim(str) {
  if (!str) return str;
  return str.replace(/^\s+/g, "");
}

async function ask(prompt) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const answer = response.data.choices[0].text;
  trimmedAnswer = ltrim(answer);
  return trimmedAnswer;
  // console.log(ltrim(answer));
}

//Ask an example question
// ask("lagu iwan fals?");

module.exports = { ask };
