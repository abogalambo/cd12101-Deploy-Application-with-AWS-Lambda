import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE

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
    const todoId = uuidv4()
    const createdAt = new Date().toISOString()

    const newTodo = {
      userId,
      todoId,
      createdAt,
      ...parsedBody
    }

    await dynamoDbClient.put({
      TableName: todosTable,
      Item: newTodo
    })

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodo
      })
    }
  }
)
