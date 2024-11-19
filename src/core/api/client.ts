import { ApolloClient, InMemoryCache } from "@apollo/client";

const LOCAL_URL = "http://localhost/";
const GRAPHQL_URL = "http://192.248.154.109/";

export const createApolloClient = () => {
  return new ApolloClient({
    uri: process.env.PRODUCTION ? GRAPHQL_URL : LOCAL_URL,
    cache: new InMemoryCache(),
  });
};
