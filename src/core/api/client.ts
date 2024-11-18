import { ApolloClient, InMemoryCache } from '@apollo/client';

export const createApolloClient = () => {
  return new ApolloClient({
    uri: "http://localhost/",
    cache: new InMemoryCache(),
  });
}