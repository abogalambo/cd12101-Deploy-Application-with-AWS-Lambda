import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { getUserTodos } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    console.log('Processing event: ', event)
    const userId = getUserId(event)

    const items = await getUserTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items
      })
    }
  }
)
