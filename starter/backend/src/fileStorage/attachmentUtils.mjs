import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client()
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export async function getUploadUrl(todoId) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: todoId
    })
    const url = await getSignedUrl(s3Client, command, {
        expiresIn: urlExpiration
    })
    return url
}

export function getPublicUrl(todoId) {
    return `https://${bucketName}.s3.amazonaws.com/${todoId}`
}