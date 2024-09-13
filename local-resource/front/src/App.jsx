import {
  RouterProvider
} from "react-router-dom"
import router from "./router/router"
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'


const client = new ApolloClient({
  uri: '/dev/graphql',
  cache: new InMemoryCache(),
});


function App() {
  return (
    <>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </>
  )
}

export default App
