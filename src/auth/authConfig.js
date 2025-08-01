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
    // localStorage istəyinə görə dəyişir
    cacheLocation: "localStorage", // "sessionStorage" əvəzinə "localStorage" istifadə edirik
    storeAuthStateInCookie: true, // Cookie-də state saxla (cross-tab üçün)
  },
  system: {
    allowNativeBroker: false, // Native broker-i deaktiv et
    windowHashTimeout: 60000, // 60 saniyə timeout
    iframeHashTimeout: 6000, // 6 saniyə iframe timeout
    loadFrameTimeout: 0, // Frame load timeout (0 = disable)
    navigateFrameWait: 0, // Frame navigation wait
  }
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
  prompt: "select_account", // Hər dəfə account seçimi göstər
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