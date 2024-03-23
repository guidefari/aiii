
import type { Document } from 'langchain/document'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube'
import { openaiApiClient, rl } from '..'
import type { OpenAIChatMessage } from '../types'
import { formatMessage, formatQAMessage, newMessage, newQAMessage } from '../util/messages'
import { writeLine } from './chat'
import path from 'node:path'

const video = `https://youtu.be/zR_iuq2evXo?si=cG8rODgRgXOx9_Cn`

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

const loadStore = async () => {
    const videoDocs = await docsFromYTVideo(video)
    // console.log('videoDocs:', videoDocs)
    // const pdfDocs = await docsFromPDF()

    // return createStore([...videoDocs, ...pdfDocs])
    return createStore([...videoDocs])
}

export const query = async () => {
    const store = await loadStore();


    const history: OpenAIChatMessage[] = [
        {
            role: 'system',
            content: 'You are a helpful AI assistant. Answer the user\'s questions to the best of your ability.',
        },
    ];

    const start = async () => {
        rl.question('You: ', async (userInput) => {
            if (userInput.toLowerCase() === 'exit') {
                rl.close();
                return;
            }

            const results = await store.similaritySearch(userInput, 2);
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

    writeLine('\n\nAI: How can I help you today?\n\n');
    start();
};
