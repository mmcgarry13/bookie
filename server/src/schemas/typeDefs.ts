const typeDefs = `
  type User {
    _id: ID
    username: String
    email: String
    password: String
    savedBooks: [Thought]!
  }

  type Book {
    bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
  }


  input UserInput {
    username: String!
    email: String!
    password: String!
  }
  
  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users: [User]
    user(username: String!): User
    books: [Book]!
    book(bookId: ID!): Book
    me: User
  }

  type Mutation {
    addUser(input: UserInput!): Auth
    login(email: String!, password: String!): Auth
    addBook(input: BookInput!): Book
    removeBook(bookId: ID!): Book
  }
`;

export default typeDefs;
