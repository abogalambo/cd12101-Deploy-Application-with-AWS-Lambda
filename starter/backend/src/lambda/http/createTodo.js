import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { createTodo } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    console.log('Processing event: ', event)
    const parsedBody = JSON.parse(event.body)
    const userId = getUserId(event)

    const newTodo = await createTodo(userId, parsedBody)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodo
      })
    }
  }
)
