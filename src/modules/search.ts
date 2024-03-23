import { Document } from 'langchain/document'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { movies } from '../data/movies'

// semantic store that can perform similarity-based searches on its content
const createStore = async () => {
    return await MemoryVectorStore.fromDocuments(
        movies.map((movie) => new Document({
            pageContent: `Title: ${movie.title}\n${movie.description}`,
            metadata: { source: movie.id, title: movie.title },
        })),
        new OpenAIEmbeddings()
    )
}


export const search = async (query: string, count = 1) => {
    const store = await createStore()
    return store.similaritySearch(query, count)
}