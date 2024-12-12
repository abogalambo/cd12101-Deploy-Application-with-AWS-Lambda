import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { getTodo, updateTodo } from '../../businessLogic/todos.mjs'
import { getUploadUrl, getPublicUrl } from '../../fileStorage/attachmentUtils.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const todo = await getTodo(userId, todoId)

    if(!todo) {
      throw new Error(`Todo ${todoId} does not exist`)
    }

    // generate upload url
    const uploadUrl = await getUploadUrl(todoId)
    const publicUrl = getPublicUrl(todoId)

    // update todo with attachment url
    await updateTodo(userId, todoId, {
      attachmentUrl: publicUrl
    })

    // return a presigned URL to upload a file for a TODO item with the provided id
    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)
