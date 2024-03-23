
import type { Document } from 'langchain/document'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube'
import { openaiApiClient } from '..'

const question = process.argv[2] || 'hi'
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

const docsFromPDF = () => {
    const loader = new PDFLoader('../data/xbox.pdf')
    return loader.loadAndSplit(
        new CharacterTextSplitter({
            separator: '. ',
            chunkSize: 2500,
            chunkOverlap: 200,
        })
    )
}

const loadStore = async () => {
    const videoDocs = await docsFromYTVideo(video)
    console.log('videoDocs:', videoDocs)
    const pdfDocs = await docsFromPDF()

    return createStore([...videoDocs, ...pdfDocs])
}

export const query = async () => {
    const store = await loadStore()
    // similaritySearch is an interesting piece here
    const results = await store.similaritySearch(question, 2)

    const response = await openaiApiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0,
        messages: [
            {
                role: 'system',
                content:
                    'You are a helpful AI assistant. Answer quesitons to the best of your abilities.',
            },
            {
                role: 'user',
                content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
          Question: ${question}
    
          Context: ${results.map((r) => r.pageContent).join('\n')}`,
            },
        ],
    })

    console.log(
        `Answer: ${response.choices[0].message.content}\n\nSources: ${results
            .map((r) => r.metadata.source)
            .join(',')}`
    )
}
