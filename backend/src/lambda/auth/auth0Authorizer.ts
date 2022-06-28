import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register';
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios';
import { Jwt } from '../../auth/Jwt';
import { JwtPayload } from '../../auth/JwtPayload';
import { Cfg } from '../../config/environments';

const logger = createLogger('auth');

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const WebKeySetUrl = Cfg.WEB_KEY_SET;
const Deny = {
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
};
const Allow = {
  principalId: '',
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
};

export const handler = async ( event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  const { authorizationToken } = event;
  
  logger.info('Authorizing a user', authorizationToken);
  try {
    const jwtToken = await verifyToken(authorizationToken);
    logger.info('User was authorized', jwtToken);
    return { ...Allow, principalId: jwtToken.sub };
  } catch (e) {
    logger.error('User not authorized', { error: e.message })
    return Deny;
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt = decodeToken(token);
  const cert = await getCertOnline(jwt);
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader){
    throw new Error('No authentication header');
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header');
  }

  const [_, token] = authHeader.split(' ');
  if (!token) {
    throw new Error('Token not provied in header');
  }
  return token;
}

function decodeToken(token: string): Jwt {
  try {
    return decode(token, { complete: true }) as Jwt;
  } catch (e) {
    throw new Error("invalid token");
  }
}

async function getCertOnline(jwt: Jwt): Promise<string> {
  const { header: { kid } = {}  } = jwt;
  try {
    const { data: { keys = [] } = {} } = await Axios.get(WebKeySetUrl);
    const signingKey = keys.find(key => key.kid === kid);
    // not found sign key
    if (!signingKey) {
      throw new Error(`Unable to find a signing key that matches '${kid}'`);
    }

    const { x5c = [] } = signingKey;
    const [x5cAt0] = x5c; 

    if (!x5cAt0) {
      throw new Error(`Unable to find a x5c at 0  of '${signingKey}'`);
    }

    return `-----BEGIN CERTIFICATE-----\n${x5cAt0}\n-----END CERTIFICATE-----`;
  } catch (e) {
    throw new Error(`Can not get Cert from ${WebKeySetUrl}, ${e.message}`);
  }
}

