import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())
const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const todo = await getTodo(todoId)

  if(!!todo) {
    await dynamoDbClient.delete({
      TableName: todosTable,
      Key: {
        todoId: todoId
      }
    })

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: "todo deleted successfully"
      })
    }
  } else {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: "todo not found"
      })
    }
  }
}

async function getTodo(todoId) {
  const result = await dynamoDbClient.get({
    TableName: todosTable,
    Key: {
      todoId
    }
  })

  console.log('Get todo: ', result)
  return result.Item
}
