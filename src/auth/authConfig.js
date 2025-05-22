// src/auth/authConfig.js
export const msalConfig = {
  auth: {
    clientId: "230458ff-ed69-4abb-8496-3888067116f6",
    authority:
      "https://login.microsoftonline.com/b3222ef7-242d-4724-a665-97b0a764f2d0",
    redirectUri:
      process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000",
    postLogoutRedirectUri:
      process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

export const graphRequest = {
  scopes: [
    "User.Read",
    "Mail.Read",
    "Directory.Read.All",
    "User.ReadBasic.All",
  ],
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphMailEndpoint: "https://graph.microsoft.com/v1.0/me/messages",
  graphDirectoryEndpoint: "https://graph.microsoft.com/v1.0/directoryObjects",
  graphUsersEndpoint: "https://graph.microsoft.com/v1.0/users",
};
