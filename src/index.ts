import OpenAI from 'openai'
import { chat } from './chat'

export const openaICE = Object.freeze(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}))

console.log("Chatbot initialized. Type 'exit' to end the chat.")




chat()