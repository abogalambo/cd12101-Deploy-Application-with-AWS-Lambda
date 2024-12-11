import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getUserId } from '../utils.mjs'

const s3Client = new S3Client()
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())
const todosTable = process.env.TODOS_TABLE

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const todo = await getTodo(userId, todoId)

  // TODO raise error if todo does not exist

  // generate upload url
  const uploadUrl = await getUploadUrl(todoId)
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  // update todo with attachment url
  await dynamoDbClient.put({
    TableName: todosTable,
    Item: {
      ...todo,
      attachmentUrl
    }
  })

  // return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}

async function getUploadUrl(todoId) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: todoId
  })
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })
  return url
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



