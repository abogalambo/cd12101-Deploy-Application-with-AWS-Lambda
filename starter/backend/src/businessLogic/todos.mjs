import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/todoAccess.mjs'

const todoAccess = new TodoAccess()

export async function getUserTodos(userId) {
    return todoAccess.getUserTodos(userId)
}

export async function createTodo(userId, attributes) {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()

    return await todoAccess.putTodo({
        todoId,
        userId,
        createdAt,
        ...attributes
    })
}

export async function updateTodo(userId, todoId, attributes) {
    const todo = await getTodo(userId, todoId)

    if(!todo) {
        throw new Error(`Todo ${todoId} does not exist`)
    }

    return await todoAccess.putTodo({
        ...todo,
        ...attributes
    })
}

export async function deleteTodo(userId, todoId) {
    const todo = await getTodo(userId, todoId)

    if(!todo) {
        throw new Error(`Todo ${todoId} does not exist`)
    }

    return await todoAccess.deleteTodo(userId, todoId)
}

export async function getTodo(userId, todoId) {
    return await todoAccess.getTodo(userId, todoId)
}




