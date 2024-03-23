// @ts-expect-error - no type package
import math from 'advanced-calculator'
import { mainApp, openaiApiClient, rl } from '..'
import type { OpenAIChatMessage } from '../types'
import { formatMessage, type newMessage } from '../util/messages'
import { writeLine } from './chat'

type CalculateType = {
    expression: string
}

// is there a better way to infer this
interface Functions {
    [key: string]: ({ expression }: CalculateType) => Promise<string>
}

// also feels like there's generally too much repetition here
const functions: Functions = {
    calculate: async ({ expression }: CalculateType): Promise<string> => {
        return math.evaluate(expression)
    },
}

const getCompletion = async (messages: OpenAIChatMessage[]) => {
    const response = await openaiApiClient.chat.completions.create({
        model: 'gpt-3.5-turbo-0613',
        messages,
        functions: [
            {
                name: 'calculate',
                description: 'Run a math expression',
                parameters: {
                    type: 'object',
                    properties: {
                        expression: {
                            type: 'string',
                            description:
                                'Then math expression to evaluate like "2 * 3 + (21 / 2) ^ 2"',
                        },
                    },
                    required: ['expression'],
                },
            },
        ],
        temperature: 0,
    })

    return response
}

export const calculate = async () => {
    const messages: OpenAIChatMessage[] = []
    let response

    rl.question('What expression do you want to evaluate?: ', async (userInput) => {
        if (userInput.toLowerCase() === 'exit') {
            mainApp()
            return
        }
        messages.push(formatMessage(userInput))

        while (true) {
            response = await getCompletion(messages)

            const firstChoice = response.choices[0]
            if (firstChoice.finish_reason === 'stop') {
                writeLine(firstChoice.message.content ?? 'Failed to evaluate expression. Try something simpler')
                calculate()
                break
            } else if (firstChoice.finish_reason === 'function_call') {
                const fnName = firstChoice.message.function_call?.name
                const args = firstChoice.message.function_call?.arguments
                if (!fnName || !args) {
                    break;
                }

                const functionToCall = functions[fnName]
                const params = JSON.parse(args)

                const result = functionToCall(params)

                messages.push({
                    role: 'assistant',
                    content: null,
                    function_call: {
                        name: fnName,
                        arguments: args,
                    },
                })

                messages.push({
                    role: 'function',
                    name: fnName,
                    content: JSON.stringify({ result: result }),
                })
            }
        }
    })



}
