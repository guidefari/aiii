import { openaiApiKey } from ".."
import type { OpenAIChatMessage } from "../types"

export const formatMessage = (userInput: string): OpenAIChatMessage => ({ role: 'user', content: userInput })

export const newMessage = async (history: OpenAIChatMessage[], message: OpenAIChatMessage) => {
    const chatCompletion = await openaiApiKey.chat.completions.create({
        messages: [...history, message],
        model: 'gpt-3.5-turbo'
    })

    return chatCompletion.choices[0].message
}
