const { ApolloServer, gql } = require('apollo-server');
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub();

// mock data
const data = [
	{ message: 'hello world', date: new Date() }
]

const typeDefs = gql`
	type Post {
		message: String!
		date: String!
	}

	type Query {
		posts: [Post!]!
	}

	type Mutation {
		addPost(message: String!): Post!
	}

	type Subscription {
		newPost: Post!
	}
`

const resolvers = {
	Query: {
		posts: () => {
			return data
		}
	},
	Mutation: {
		addPost: (_, { message }) => {
			const post = JSON.stringify({ message, date: new Date() })
			data.push(post)
			pubsub.publish('NEW_POST', { newPost: post }) // Publish!
			return post
		}
	},
	Subscription: {
		newPost: {
            resolve: (post) => {
                return (post.newPost)
            },
			subscribe: () => pubsub.asyncIterator('NEW_POST')
		}
	}
}

const server = new ApolloServer({ 
	typeDefs, 
	resolvers
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});