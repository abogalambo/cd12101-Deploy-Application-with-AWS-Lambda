import jsonwebtoken from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUri = 'https://dev-2qf4nym7ekg4r4w5.us.auth0.com/.well-known/jwks.json'
const jwksClient = new JwksClient({ jwksUri })

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })
  const { kid } = jwt.header
  const signingKey = await jwksClient.getSigningKey(kid);
  const publicKey = signingKey.getPublicKey();

  return jsonwebtoken.verify(token, publicKey, { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
