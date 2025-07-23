import { ApolloProvider } from '@apollo/client';
import client from './graphql/apolloClient';
import Index from './Index';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Index />
    </ApolloProvider>
  );
}