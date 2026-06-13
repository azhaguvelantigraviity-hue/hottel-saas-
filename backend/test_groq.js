require('dotenv').config({ path: './.env' });
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'hi' }],
      model: 'llama3-8b-8192',
    });
    console.log('Success:', chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error('Error:', err);
  }
}
main();
