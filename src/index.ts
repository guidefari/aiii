import OpenAI from 'openai'
import { chat } from './modules/chat'
import { search } from './modules/search'
import readline from 'node:readline'

export const openaICE = Object.freeze(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}))

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Select an option - (1) Run chat app, (2) Search, (3) Exit: ', (answer) => {
  switch (answer) {
    case '1':
      chat()
      break;
    case '2':
      search('cute and furry')
      break;
    case '3':
      console.log('Exiting...');
      rl.close();
      break;
    default:
      console.log('Invalid option selected');
  }

});