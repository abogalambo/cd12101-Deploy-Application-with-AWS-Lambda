import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())
const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const updatedTodo = JSON.parse(event.body)
  const userId = "123"
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
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: "todo not found"
      })
    }
  }
}

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
