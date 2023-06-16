export const getAppBaseUrl = () => {
  return process.env.NODE_ENV === "production"
    ? "https://manageprompt.com"
    : "http://localhost:3000";
};
