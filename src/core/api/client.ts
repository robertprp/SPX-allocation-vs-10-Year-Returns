import { ApolloClient, InMemoryCache } from "@apollo/client";

// Urls
const LOCAL_URL = "http://127.0.0.1:8001/";
const GRAPHQL_URL = "https://29ba-79-151-230-65.ngrok-free.app/";

export const createApolloClient = () => {
  return new ApolloClient({
    uri: !!process.env.PRODUCTION ? GRAPHQL_URL : LOCAL_URL ,
    cache: new InMemoryCache(),
  });
};
