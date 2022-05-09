# CATCHAT

Catchat is a cat-themed chat application! Catchat v1 has two great features:

1. A chat room.
2. Meow-masking, which replaces certain words with "meow" when they appear in chat.

**Objective**: Your job is to take Catchat to the next level by adding authentication.

# Directions

Catchat v1 comes with these components:

- React frontend client
- Node backend server

You will add a third component: an Azure Active Directory identity provider (aka Azure AD) to store chat users. Then you'll update the client and server code to integrate with the identity provider.

## Architecture Notes

TODO Feature matrix
TODO Sequence diagram

## Start Catchat

Before making changes, let's explore Catchat v1. 

Clone the repo to your local machine, checkout the **v1** tag, and start the server. 

```
git checkout v1
cd server
npm run build && npm run start
```

Then in another console window, start the client:

```
cd client
npm run build && npm run start
```

Now you can chat! Open up http://localhost:8080 in a browser, and you should be able to send messages to yourself. You can open the client up in other browsers (or a private window) to create additional users.

Play with the application, take a look at the code, and see if you can answer these questions. 

#### Questions

-  Where do the chat users' names come from?
-  How do messages get sent between users?
-  How does meow-masking work?
-  What happens when you restart the server?

## Set up Identity Provider

An **Identity Provider** is an entity that provides services for authenticating users. We will use Microsoft Azure AD for our identity provider. 

Azure AD is free, but you will need to set up an account on Microsoft Azure first. We won't cover the process for signing up for Azure here. 

Once you have an Azure account, follow these instructions to set up Azure AD to work with Catchat.

### Create an Azure AD tenant

First we'll create an Azure AD **tenant**. A tenant is an instance of Azure AD dedicated to a single organization. Each tenant has a **directory**, which serves as the identity provider for the tenant. 

Catchat's users, permissions, and application settings will all live in this directory.

Note: If you already have an Azure account with multiple directories, complete these steps from the **Default Directory**. (If you don't know what this means, feel free to ignore this warning and proceed).

1. Go to portal.azure.com.
2. Select **Create a resource**. 
3. Search for **Azure Active Directory**.
4. Select **Create**.
5. Provide a clever oganization name and domain name.
6. Select **Review and Create**.
7. Once the tenant is created, click the generated link to visit it, or use the **Switch Directory** link under your username.

You should now see a screen that looks like this:

TODO

Explore this page a bit and try to answer these questions.

#### Questions

- What users does your directory currently contain?
- What time did you first sign in to this directory, and from what IP address?
- How can you switch to another tenant?

### Create a User

Now that we have a directory, let's add a user to it.

1. From the directory page, select **Users**.
2. Select **New User**.
3. Fill in the required fields.
4. Copy username and the initial password.
5. Select **Create**.

Let's now log in as that user and set a password.

1. In the sign-in menu on the upper-right, select **Sign in with a different account**.
2. Enter the user credentials into the login form.
3. Change your password when prompted.

You should now be logged in to the Azure portal as the user you just created.

#### Questions

- What settings in the directory are available / unavailable to this user?
- Can you reset your own password from the directory?
- Can you add new users?

### Add App Registrations 

In this step we'll create **app registrations** in Azure AD. An app registration configures authentication workflows and settings for apps that use the directory. 

We'll create two app registrations, one for the Catchat backend, and one for the frontend.

Before beginning, make sure you are logged in as the admin user that created your tenant.

#### Backend registration

##### Register the app

1. Go to the main Azure AD page. 
2. Select **App registrations**.
3. Select **New registration**.
4. For "Name", enter `API`.
5. For "Supported Account Types", select **Accounts in any organizational directory**. 
6. Select **Register**. This should open up the settings for your new app.

##### Add authentication settings

1. In the app settings, select **Expose an API**.
2. Set the **Application ID URI** to a friendly but unique name, like `api://my-cat-chat`.
3. Select **Add a scope**.
4.  For **Scope name**, put `Chat.Messaging`.
5.  For **Who can consent**, select `Admins and users`.
6.  For **Admin consent display name**, put `Allow reading and writing chat messages`.
7.  For **Admin consent description**, put the same message, or whatever you like.
8.  Select **Add Scope** to save.

#### Frontend registration

##### Register the app

1. Go to the main Azure AD page. 
2. Select **App registrations**.
3. Select **New registration**.
4. For "Name", enter `SPA`.
5. For "Supported Account Types", select **Accounts in any organizational directory**. 
6. For "Redirect URI" select **Single-page application** and enter `http://localhost:8080`.
7. Select **Register**. This should open up the settings for your new app.

##### Add authentication settings

1. In the app settings, select **Authentication**.
2. Under **Implicit grant and hybrid flows** check the boxes next to **Access tokens** and **ID tokens**.
3. Click **Save**.
4. Navigate to **API permissions**.
5. Select **Add a permission**.
6. In the form that appears, navigate to **My APIs** and select the API you created for the backend.
7. Select **Delegated permissions**.
8. Check the box next to the permission you created earlier.
9. Click **Add permission** to save.

## Add authentication code to frontend 

Now it's time to integrate Catchat with our identity provider. We'll start with the frontend.

### Set up environment variables

Catchat uses a library called MSAL to talk to Azure AD. Catchat already has the MSAL package installed, but we'll need to configure the library so it can find our tenant and app. We'll store these settings in environment variables, and use the `dotenv` package for local development.

Create a file called `.env` to hold these local settings:

```
cd client
touch .env
```

Then open the file and add these variables: 

```
CLIENT_ID=<SPA_APPLICATION_ID>
REDIRECT_URI=http://localhost:8080
SERVER_URI=http://localhost:3000
AUTHORITY=https://login.microsoftonline.com/organizations/
KNOWN_AUTHORITY=login.microsoft.com
SCOPE=api://<API_APPLICATION_ID_URI>/Chat.Messaging
```

You can find the two custom settings in your Azure AD directory:
- The `SPA_APPLICATION_ID` appears on the overview pane of the SPA app registration page. 
- The `API_APPLICATION_ID_URI` appears on the overview pane of the API app registration page, for example `my-cat-chat`.

### Instantiate MSAL

Now we'll [create an instance of MSAL](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md) so the frontend can talk to Azure AD. 

Open `client/src/authenticate.ts`. This is where we'll store the base-level authentication code which the frontend code will interact with.

First, import MSAL.

```
import * as msal from '@azure/msal-browser';
```

Next, pull in the environment variables and add them to a configuration object.

```
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
```

Finally, pass the configuration object to the constructor of `PublicClientApplication` to create an instance.

```
const msalInstance = new msal.PublicClientApplication(msalConfig);
```

### Create login function 

We can call methods on `msalInstance` to perform authentication tasks. The first thing we should implement is a function to log users in. 

Refer to [this documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/login-user.md), and implement the `login` function.

Notes:
- Use the "redirect" interaction type.
- Include a `scopes` option when calling the MSAL method. 

### Create logout function

Use [this documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/logout.md) to create a `logout` function.

Notes:
- Use the "redirect" interaction type.

### Gather ye tokens

When we call the MSAL method to log a user in, it will redirect the browser to a Microsoft login screen. If login is successful, the login screen will redirect the browser back to Catchat, with an authorization code. MSAL will then call Azure AD with the authorization code, and exchange it for tokens, which our app can use.

Create a function called `getTokens` that calls `handleRedirectPromise()` to retrieve tokens. The `getTokens` function should return an object that contains the raw access token, and claims from the ID token, (like the user's name):

```
{
  accessToken
  idClaims
}
```

See [documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications) for details on `handleRedirectPromise`.


### Add a login header

Let's use the authentication functions we created to improve the user experience of Catchat.

Users should have button to log in and log out, and their name should appear to confirm they've logged in. Luckily, Catchat already includes a component to encapsulate these features, called `LoginHeader.tsx`.

Replace the static `h1` header in Catchat v1 with the `LoginHeader` component. 

### Add username to chat messages

With the login header in place, we can log in and log out, and we can see our name, but we're still using a randomly-generated username in chat. Let's fix that.

Replace the random user with relevant claims sent back in the token response, so that chat users see their own names next to chat messages.

## Protect server access 

So far we've used information found in the ID token to enhance the Catchat user experience, but we haven't really secured the application. Let's update the server so that only users with valid access tokens can use Catchat.

First we'll add server middleware which will decode the access token, read its claims, and verify specific claims. 

With the server checking access tokens, the client will no longer have access to its endpoints. So we'll also update the client's API layer to send an access token with each request.

### Set up dependencies

We want our chat server to inspect access tokens coming from the client and verify each token, but what exactly should we verify about the token? We can check any part of the token we'd like, such as specific claims, header information, and whether the signature is valid. 

If we need a robust solution to cover a lot of token validation scenarios, we'll probably want to use an authentication library such as Passport. But to start out, let's simply check specific claims manually. 

#### Add environment variables

Create a `.env` file for the server.

```
cd server
touch .env
```

Then add two entries to the `.env` file.

```
CLIENT_APP_ID=<CLIENT_APPLICATION_ID>
AUDIENCE=<API_APPLICATION_ID_URI>
```

You can find the two custom settings in your Azure AD directory:
- The `CLIENT_APPLICATION_ID` appears on the overview pane of the SPA app registration page. 
- The `API_APPLICATION_ID_URI` appears on the overview pane of the API app registration page, for example `api://my-cat-chat`.

Next, open `server/src/index.ts` and pull the enviroment variables in. Add these constant declarations below the `dotenv` call:

```
require('dotenv').config();

const CLIENT_APP_ID = process.env.CLIENT_APP_ID;
const AUDIENCE = process.env.AUDIENCE;
```

#### Add libraries

Add these imports to the server:

```
import { Request, Response, NextFunction } from 'express';
import { decode, JwtPayload } from 'jsonwebtoken';
```

The imports from `express` will allow us to create a middleware. The imports from `jsonwebtoken` will allow us to read the contents of the access token.


### Parse access token claims

In order to verify the claims in an access token, we must first decode it.

Create a utility function called `parseClaims` which will decode tokens. It should have a signature like this:

```
(token: string) => JwtPayload | null
```

### Implement middleware

With our `parseClaims` function, we can now read access tokens and verify their contents. We want to do this on each request to the server, but how?

We could add code to each endpoint that performs this check. However, this approach would mean repeating the same authentication code in multiple places, making that code brittle and difficult to maintain. Extracting the authentication code into a separate function would help with these issues, but we still run the risk of forgetting to call the authentication function when we add a new endpoint.

Instead, we can write an Express *middleware*. 

Our middleware will inspect each incoming request before it reaches an endpoint, inspect its access token, and return an error status to the client if the token check fails.

See the [Express docs](https://expressjs.com/en/guide/writing-middleware.html) on writing middleware for more information.

#### Write middleware function

Create a function called `accessTokenValidator` with the following signature:

```
(req: Request, res: Response, next: NextFunction) => void
```

The function should:

- Pull the access token from the **authorization header** of each request;
- Parse the claims from the token;
- Compare the `aud` claim with the `AUDIENCE` environment variable;
- Compare the `appid` claim with the `CLIENT_APP_ID` environment variable;
- Return a 401 status code if either claim does not match;
- Pass the request on to its handler if both claims match.

Use this middleware for all requests.

### Send access tokens from client

With the chat server locked down, the client must now send an access token with each request.

Update the API functions in `client/src/api.ts` so that they pass a Bearer token in the Authorization header. Be sure to include the string `Bearer`. 

Then update any applicable frontend code so that it passes the access token to these API functions.

If you've hooked everything up correctly, you should only be able to send and receive chat messages with a valid access token.
