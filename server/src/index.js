import express from 'express';
import { createServer } from 'http';
import { PubSub } from 'apollo-server';
import { ApolloServer, gql } from 'apollo-server-express';
import fetch from "node-fetch";

const app = express();

const pubsub = new PubSub();
const TIME_CREATED = 'TIME_CREATED';
let userId = 1;
let sampleData = [];

const typeDefs = gql`
  type Time {
    id: Int
    content: String
  }

  type User {
    id: Int
    name: String
  }

  type Response {
    success: Boolean!
  }

  type Query {
    getTime: [Time!]!
    getUsers: [User!]!
  }

  type Mutation {
    createUser(name: String!): User!
    updateUser(id: Int!, name: String!): User!
    deleteUser(id: Int!): Response!
  }

  type Subscription {
    timeCreated: Time
  }
`;

const switchToRestAPI = false;

const resolvers = {
  Query: {
    getTime: () => [],
    getUsers: async () => {
      if (switchToRest === true) {
        const userList = await fetch('http://localhost:8001/users/', {
          method: 'GET'
        }).then(res => res.json());

        return userList;
      }
      return sampleData;
    }
  },
  Mutation: {
    createUser: async (parent, { name }) => {
      if (switchToRestAPI === true) {
        const createdUser = await fetch('http://localhost:8001/user/create', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name })
        }).then(res => res.json());

        if(!createdUser.success) {
          throw new Error('Tên người dùng đã tồn tại');
        }

        return {
          id: createdUser.data.id,
          name: createdUser.data.name,
        }
      }

      const findUser = sampleData.filter(el => el.name === name);

      if (findUser.length > 0) {
        throw new Error('Tên người dùng đã tồn tại');
      }

      sampleData.push({ id: userId, name });
      userId = ++userId;

      return {
        id: userId,
        name
      }
    },
    updateUser: async (parent, { id, name }) => {
      if (switchToRestAPI === true) {
        const updatedUser = await fetch('http://localhost:8001/user/edit', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, name })
        }).then(res => res.json());

        if(!updatedUser.success) {
          throw new Error('Tên người dùng đã tồn tại');
        }

        return {
          id: updatedUser.data.id,
          name: updatedUser.data.name,
        }
      }

      const findUser = sampleData.filter(el => el.name === name && el.id !== id);

      if (findUser.length > 0) {
        throw new Error('Tên người dùng đã tồn tại');
      }

      sampleData.forEach((ele, index) => {
        if (ele.id === id) {
          sampleData[index].name = name;
        }
      });

      return {
        id,
        name
      }
    },
    deleteUser: async (parent, { id }) => {
      if (switchToRestAPI === true) {
        const deletedUser = await fetch('http://localhost:8001/user/delete', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id })
        }).then(res => res.json());

        if(!deletedUser.success) {
          throw new Error('Xoá người dùng thất bại');
        }

        return {
          success: true
        }
      }

      sampleData = sampleData.filter(el => el.id !== id);

      return {
        success: true
      }
    }
  },
  Subscription: {
    timeCreated: {
      subscribe: () => pubsub.asyncIterator(TIME_CREATED),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 8000 }, () => {
  console.log('Apollo Server listening on http://localhost:8000/graphql');
});


function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function timeRender() {
  var d = new Date();
  var h = addZero(d.getHours());
  var m = addZero(d.getMinutes());
  var s = addZero(d.getSeconds());
  return h + ":" + m + ":" + s;
}

let timeId = 2;
setInterval(() => {
  pubsub.publish(TIME_CREATED, {
    timeCreated: { timeId, content: timeRender },
  });

  timeId++;
}, 1000);
