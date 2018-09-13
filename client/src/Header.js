import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_TIME = gql`
  query {
    getTime {
      id
      content
    }
  }
`;

const TIME_CREATED = gql`
  subscription {
    timeCreated {
      id
      content
    }
  }
`;



class CurrentTime extends React.Component {
  componentDidMount() {
    this.props.subscribeToMore({
      document: TIME_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          getTime: [
            // ...prev.getTime,
            subscriptionData.data.timeCreated,
          ],
        };
      },
    });
  }

  render() {
    return (
      <nav className="navbar navbar-inverse">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand">
              {this.props.time.map(date => (
                <label key={date.id}>Current time: {date.content}</label>
              ))}
            </a>
          </div>
        </div>
      </nav>
    );
  }
}

const Header = () => (
  <Query query={GET_TIME}>
    {({ data, loading, subscribeToMore }) => {
      if (!data) {
        return null;
      }

      if (loading) {
        return <span>Loading ...</span>;
      }

      return (
        <CurrentTime
          time={data.getTime}
          subscribeToMore={subscribeToMore}
        />
      );
    }}
  </Query>
);

export default Header;
