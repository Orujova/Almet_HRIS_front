// src/auth/authConfig.js
export const msalConfig = {
  auth: {
<<<<<<< HEAD
    clientId: "230458ff-ed69-4abb-8496-3888067116f6",
    authority: "https://login.microsoftonline.com/b3222ef7-242d-4724-a665-97b0a764f2d0",
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "https://localhost:3000",
    postLogoutRedirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "https://localhost:3000",
  },
  cache: {
=======
    clientId: "230458ff-ed69-4abb-8496-3888067116f6", 
    authority: "https://login.microsoftonline.com/b3222ef7-242d-4724-a665-97b0a764f2d0",
    redirectUri: "http://localhost:3000",
    postLogoutRedirectUri: "http://localhost:3000", 
  },
 cache: {
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

<<<<<<< HEAD
export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

export const graphRequest = {
  scopes: ["User.Read", "Mail.Read", "Directory.Read.All", "User.ReadBasic.All"],
};

=======
// Add scopes for the ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"]
};

// Add scopes for the access token to be used at Microsoft Graph API endpoints.
export const graphRequest = {
  scopes: ["User.Read", "Mail.Read", "Directory.Read.All", "User.ReadBasic.All"]
};

// Microsoft Graph API endpoint configuration
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphMailEndpoint: "https://graph.microsoft.com/v1.0/me/messages",
  graphDirectoryEndpoint: "https://graph.microsoft.com/v1.0/directoryObjects",
  graphUsersEndpoint: "https://graph.microsoft.com/v1.0/users",
};