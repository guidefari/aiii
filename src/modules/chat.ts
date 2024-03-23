import readline from 'node:readline'
import { formatMessage, newMessage } from '../util/messages'
import type { OpenAIChatMessage } from '../types'
import { mainApp, rl } from '..'


export const chat = () => {
    console.log("Chatbot initialized. Type 'exit' to end the chat.")

    const history: OpenAIChatMessage[] = [
        {
            role: 'system',
            content: `You are a helpful AI assistant. Answer the user's questions to the best of you ability.`,
        }
    ]
    const start = async () => {
        rl.question('You: ', async (userInput) => {
            if (userInput.toLowerCase() === 'exit') {
                mainApp()
                return
            }
            const userMessage = formatMessage(userInput)

            try {
                const response = await newMessage(history, userMessage)
                response && history.push(userMessage, response)
                writeLine(`\n\nAI: ${response.content}\n\n`)
            } catch (error) {
                console.info('We have a problem houston:', error)
            }

            start()
        })
    }

    writeLine('\n\nAI: How can I help you today?\n\n')
    start()
}

export const writeLine = (text: string) => {
    process.stdout.write(text)
}

