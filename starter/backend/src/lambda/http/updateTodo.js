import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
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
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body)
    const userId = getUserId(event)
    const todo = await getTodo(userId, todoId)

    if(!!todo) {
      const todoAttributes = {
        ...todo,
        ...updatedTodo
      }

      await dynamoDbClient.put({
        TableName: todosTable,
        Item: todoAttributes
      })

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(todoAttributes)
      }
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "todo not found"
        })
      }
    }
  }
)

async function getTodo(userId, todoId) {
  const result = await dynamoDbClient.get({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    }
  })

  console.log('Get todo: ', result)
  return result.Item
}
