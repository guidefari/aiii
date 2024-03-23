import { mainApp, rl, store } from '..'




export const search = async (count: number = 1) => {


    rl.question('What kind of movie you looking for?: ', async (query) => {
        if (query.toLowerCase() === 'exit') {
            mainApp()
            return
        }

        try {
            const result = await store.similaritySearch(query, count)
            console.log(result)

        } catch (error) {
            console.info('Search error:', error)
        }

        search()
    })


}