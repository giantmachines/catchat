import * as msal from '@azure/msal-browser';
// import syncUI from './ui';

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const AUTHORITY = process.env.AUTHORITY;
const KNOWN_AUTHORITY = process.env.KNOWN_AUTHORITY;  
const SCOPE = process.env.SCOPE;

const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    authority: AUTHORITY,
    knownAuthorities: [KNOWN_AUTHORITY],
    postLogoutRedirectUri: REDIRECT_URI,
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const request = {
  scopes: [SCOPE],
};

export function login() {
  console.log('logging in');
  msalInstance.acquireTokenRedirect(request);
}

export function logout() {
  console.log('logging out');
  msalInstance.logoutRedirect();
}

export async function getTokens() {
  let accessToken;
  let idClaims;
  let tokenResult = await msalInstance.handleRedirectPromise();
  if (tokenResult) {
    console.log('got some token(s)', tokenResult);
    accessToken = tokenResult.accessToken;
    idClaims = tokenResult.idTokenClaims;
  }
  return ({ accessToken, idClaims });
}
