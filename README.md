# CATCHAT

Catchat is a cat-themed chat application! Catchat v1 has two great features:

1. A chat room.
2. Meow-masking, which replaces certain words with "meow" when they appear in chat.

**Objective**: Your job is to take Catchat to the next level by adding authentication.

## Directions

Catchat v1 comes with these components:

- React frontend client
- Node backend server

You will add a third component: an Azure Active Directory identity provider (aka Azure AD) to store chat users. Then you'll update the client and server code to integrate with the identity provider.

### Start Catchat

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

##### Questions

-  Where do the chat users' names come from?
-  How do messages get sent between users?
-  How does meow-masking work?
-  What happens when you restart the server?

### Architecture Notes

### Set up Identity Provider

An **Identity Provider** is an entity that provides services for authenticating users. We will use Microsoft Azure AD for our identity provider. 

Azure AD is free, but you will need to set up an account on Microsoft Azure first. We won't cover the process for signing up for Azure here. 

Once you have an Azure account, follow these instructions to set up Azure AD to work with Catchat.

#### Create an Azure AD tenant

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

##### Questions

- What users does your directory currently contain?
- What time did you first sign in to this directory, and from what IP address?
- How can you switch to another tenant?

#### Create a User

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

##### Questions

- What settings in the directory are available / unavailable to this user?
- Can you reset your own password from the directory?
- Can you add new users?

#### Add App Registrations 

In this step we'll create **app registrations** in Azure AD. An app registration configures authentication workflows and settings for apps that use the directory. 

We'll create two app registrations, one for the Catchat backend, and one for the frontend.

Before beginning, make sure you are logged in as the admin user that created your tenant.

##### Backend registration

###### Register the app

1. Go to the main Azure AD page. 
2. Select **App registrations**.
3. Select **New registration**.
4. For "Name", enter `API`.
5. For "Supported Account Types", select **Accounts in any organizational directory**. 
6. Select **Register**. This should open up the settings for your new app.

###### Add authentication settings

1. In the app settings, select **Expose an API**.
2. Set the **Application ID URI** to a friendly but unique name, like `api://my-cat-chat`.
3. Select **Add a scope**.
4.  For **Scope name**, put `Chat.Messaging`.
5.  For **Who can consent**, select `Admins and users`.
6.  For **Admin consent display name**, put `Allow reading and writing chat messages`.
7.  For **Admin consent description**, put the same message, or whatever you like.
8.  Select **Add Scope** to save.

##### Frontend registration

###### Register the app

1. Go to the main Azure AD page. 
2. Select **App registrations**.
3. Select **New registration**.
4. For "Name", enter `SPA`.
5. For "Supported Account Types", select **Accounts in any organizational directory**. 
6. For "Redirect URI" select **Single-page application** and enter `http://localhost:8080`.
7. Select **Register**. This should open up the settings for your new app.

###### Add authentication settings

1. In the app settings, select **Authentication**.
2. Under **Implicit grant and hybrid flows** check the boxes next to **Access tokens** and **ID tokens**.
3. Click **Save**.
4. Navigate to **API permissions**.
5. Select **Add a permission**.
6. In the form that appears, navigate to **My APIs** and select the API you created for the backend.
7. Select **Delegated permissions**.
8. Check the box next to the permission you created earlier.
9. Click **Add permission** to save.

### Add authentication code to frontend 

Now it's time to integrate Catchat with our identity provider. We'll start with the frontend.

#### Set up environment variables

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
- The Application ID appears on the overview pane of the SPA app registration page. 
- The Application ID URI appears on the overview pane of the API app registration page. 

#### Instantiate MSAL

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

#### Create login function 

We can call methods on `msalInstance` to perform authentication tasks. The first thing we should implement is a function to log users in. 

Refer to [this documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/login-user.md), and implement the `login` function.

Notes:
- Be sure to export the function.
- Use the "redirect" interaction style.
- Include a `scopes` option when calling the MSAL method. 


















