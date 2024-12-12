import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

export class TodoAccess {
    constructor(
        todosTable = process.env.TODOS_TABLE,
        todosCreatedAtIndex = process.env.TODOS_INDEX
    ) {
        this.documentClient = new DynamoDB()
        this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
        this.todosTable = todosTable
        this.todosCreatedAtIndex = todosCreatedAtIndex
    }

    async getUserTodos(userId) {
        console.log('Getting user todos for user', userId)

        const result = await this.dynamoDbClient.query({
            TableName: this.todosTable,
            IndexName: this.todosCreatedAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        })

        return result.Items
    }

    async putTodo(todo) {
        console.log(`Putting a todo with id ${todo.id}`)

        await this.dynamoDbClient.put({
            TableName: this.todosTable,
            Item: todo
        })

        return todo
    }

    async getTodo(userId, todoId) {
        console.log(`Getting a todo with id ${todoId}`)

        const result = await this.dynamoDbClient.get({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        })

        return result.Item
    }

    async deleteTodo(userId, todoId) {
        console.log(`Deleting a todo with id ${todoId}`)

        await this.dynamoDbClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        })
    }
}
