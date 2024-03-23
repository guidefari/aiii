import OpenAI from 'openai'
import { chat } from './modules/chat'
import { search } from './modules/search'
import readline from 'node:readline'
import { movies } from './data/movies'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { query } from './modules/qa'

export const openaiApiClient = Object.freeze(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}))

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


// semantic store that can perform similarity-based searches on its content
export const createStore = async () => {
  return await MemoryVectorStore.fromDocuments(
    movies.map((movie) => new Document({
      pageContent: `Title: ${movie.title}\n${movie.description}`,
      metadata: { source: movie.id, title: movie.title },
    })),
    new OpenAIEmbeddings()
  )
}
export const store = await createStore()

export const mainApp = async () => {
  rl.question('Select an option - (1) Run chat app, (2) Search, (3) Query Document and youtube, (4) Exit: ', (answer) => {
    switch (answer.toLowerCase()) {
      case '1':
        chat()
        break;
      case '2':
        search()
        break;
      case '3':
        query()
        break;
      case '4':
      case 'exit':
        console.log('Exiting...');
        rl.close();
        break;
      default:
        console.log('Invalid option selected');
    }

  });

}

mainApp()