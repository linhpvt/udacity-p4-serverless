// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'hs5fwb1637';
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`;
// https://hs5fwb1637.execute-api.us-east-1.amazonaws.com/dev
export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  // use Certificate to verify token at the backend
  domain: 'dev-myljydm5.us.auth0.com',            // Auth0 domain
  clientId: 'LHDbFYZLmqkv1qZqBU52gOZ6QV4FmVGC',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
