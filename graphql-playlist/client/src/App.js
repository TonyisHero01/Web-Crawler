import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import './index.css'
import axios from 'axios';

//components
import BookList from './components/BookList'
import PageList from './components/PageList'
import Page2List from './components/Page2List';
import ActivationButton from './components/ActivationButton';
import InactivationButton from './components/InactivationButton';

//apollo client setup
const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql'
});

class App extends Component {
  handleModeChange = (newMode) => {
    axios.post('http://localhost:4000/api/updateConfig', { newConfig: newMode })
        .then(response => {
            console.log(response.data); // Output: Config updated successfully.
            // Optionally handle success feedback or UI updates
        })
        .catch(error => {
            console.error('Error updating config:', error);
            // Handle error scenarios
        });
};
  render() {
    return (
      <ApolloProvider client={client}>
        <div id="main">
          <h1>Tony's Crawling List</h1>
          <ActivationButton onClick={() => this.handleModeChange('active')} />
          <InactivationButton onClick={() => this.handleModeChange('inactive')} />
          <Page2List />
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
