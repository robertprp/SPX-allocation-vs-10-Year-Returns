import { ApolloClient, InMemoryCache } from "@apollo/client";

// Urls
const LOCAL_URL = "http://localhost/";
const GRAPHQL_URL = "http://api.finance.rbus.me/";

export const createApolloClient = () => {
  return new ApolloClient({
    uri: process.env.PRODUCTION ? GRAPHQL_URL :  LOCAL_URL ,
    cache: new InMemoryCache(),
  });
};
