import type { Document } from "langchain/document"
import { openaiApiClient } from ".."
import type { OpenAIChatMessage } from "../types"

export const formatMessage = (userInput: string): OpenAIChatMessage => ({ role: 'user', content: userInput })


export const formatQAMessage = (userInput: string, similaritySearchResults: Document[]): OpenAIChatMessage => ({
    role: 'user',
    content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
Question: ${userInput}

Context: ${similaritySearchResults.map((r) => r.pageContent).join('\n')}`,
})

export const newMessage = async (history: OpenAIChatMessage[], message: OpenAIChatMessage) => {
    const chatCompletion = await openaiApiClient.chat.completions.create({
        messages: [...history, message],
        model: 'gpt-3.5-turbo'
    })

    return chatCompletion.choices[0].message
}

type QA_Message = {
    history: OpenAIChatMessage[]
    message: OpenAIChatMessage

}

export const newQAMessage = async ({ history, message }: QA_Message) => {

    const chatCompletion = await openaiApiClient.chat.completions.create({
        messages: [...history, message],
        model: 'gpt-3.5-turbo'
    })

    return chatCompletion.choices[0].message
}

