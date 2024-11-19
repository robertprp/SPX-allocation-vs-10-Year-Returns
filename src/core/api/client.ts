import { ApolloClient, InMemoryCache } from "@apollo/client";

export const createApolloClient = () => {
  return new ApolloClient({
    uri: "http://192.248.154.109/",
    cache: new InMemoryCache(),
  });
};
