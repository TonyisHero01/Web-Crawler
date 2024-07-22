import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';
//import OutgoingLinkList from './OutgoingLinkList';
const getPagesQuery = gql`
    {
        pages {
            title
            url
            id
            outgoing_links {
                url
                id
            }
        }
    }
`

class PageList extends Component {
    displayPages() {
        var data = this.props.data;
        if(data.loading) {
            return( <div>Loading pages...</div> );
        } else {
            return data.pages.map(page => {
                return(
                    <li key={page.id}>
                        {page.title}: {page.url}
                        {page.outgoing_links && page.outgoing_links.length > 0 && 
                            <span>, outgoing_links: 
                                <ul>
                                    {page.outgoing_links.map(link => (
                                        <li key={link.id}>{link.url}</li>
                                    ))}
                                </ul>
                            </span>
                        }
                    </li>
                )
            });
        }
    }
    render() {
        return (
            <div>
            <ul id="page-list">
                {this.displayPages()}
            </ul>
            </div>
        );
    }   
}


export default graphql(getPagesQuery)(PageList);