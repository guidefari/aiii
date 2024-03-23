
import type { Document } from 'langchain/document'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube'
import { mainApp, openaiApiClient, rl } from '..'
import type { OpenAIChatMessage } from '../types'
import { formatMessage, formatQAMessage, newMessage, newQAMessage } from '../util/messages'
import { writeLine } from './chat'
import path from 'node:path'

export const createStore = (docs: Document[]) =>
    MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings())

export const docsFromYTVideo = (video: string) => {
    const loader = YoutubeLoader.createFromUrl(video, {
        language: 'en',
        addVideoInfo: true,
    })
    return loader.loadAndSplit(
        new CharacterTextSplitter({
            separator: ' ',
            chunkSize: 2500,
            chunkOverlap: 100,
        })
    )
}

// const docsFromPDF = () => {
//     const parentDirectory = path.resolve('.', '..')
//     const filePath = `${parentDirectory}/data/xbox.pdf`;
//     const loader = new PDFLoader('xbox.pdf')
//     return loader.loadAndSplit(
//         new CharacterTextSplitter({
//             separator: '. ',
//             chunkSize: 2500,
//             chunkOverlap: 200,
//         })
//     )
// }

const loadStore = async (video: string) => {
    const videoDocs = await docsFromYTVideo(video)
    // const pdfDocs = await docsFromPDF()

    // return createStore([...videoDocs, ...pdfDocs])
    return createStore([...videoDocs])
}

export const query = async () => {
    writeLine('\n\nThis module allows you to ask questions about a youtube video🔥\n\n');
    let store: MemoryVectorStore

    readlineInput('Enter video URL: ', async (video) => {
        store = await loadStore(video)
        return start();
    })

    const history: OpenAIChatMessage[] = [
        {
            role: 'system',
            content: 'You are a helpful AI assistant. Answer the user\'s questions to the best of your ability.',
        },
    ];

    const start = async () => {

        readlineInput('What would you like to know about the video: ', async (userInput) => {
            if (userInput.toLowerCase() === 'exit') {
                mainApp();
                return;
            }

            const results = await store.similaritySearch(userInput, 20);
            const message = formatQAMessage(userInput, results);

            try {
                const response = await newQAMessage({ history, message });
                response && history.push(message, response);
                writeLine(`\n\nAI: ${response.content}\n\n`);
            } catch (error) {
                console.info('We have a problem houston:', error);
            }

            start();
        });
    };

};

const readlineInput = async (prompt: string, callback: (userInput: string) => Promise<void>) => {
    return rl.question(prompt, callback)
}