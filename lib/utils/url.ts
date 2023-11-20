export const getAppBaseUrl = () => {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;

  return process.env.NODE_ENV === "production"
    ? "https://manageprompt.com"
    : "http://localhost:3000";
};
