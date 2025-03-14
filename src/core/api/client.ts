import { ApolloClient, InMemoryCache } from "@apollo/client";

// Urls
const LOCAL_URL = "http://localhost:4491/";
const GRAPHQL_URL = "https://29ba-79-151-230-65.ngrok-free.app/";

export const createApolloClient = () => {
  return new ApolloClient({
    uri: process.env.PRODUCTION ? GRAPHQL_URL :  LOCAL_URL ,
    cache: new InMemoryCache(),
  });
};
