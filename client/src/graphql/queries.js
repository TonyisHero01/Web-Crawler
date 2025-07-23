import { gql } from '@apollo/client';

export const GET_PAGES = gql`
  query GetPages($website_record_id: ID) {
    pages(website_record_id: $website_record_id) {
      _id
      url
      title
      time
      links
      from_id
      from {
        _id
        title
        url
      }
    }
  }
`;

export const GET_WEBSITE_RECORDS = gql`
  query {
    website_records {
      id
      label
    }
  }
`;