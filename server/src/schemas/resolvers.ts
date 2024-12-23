import User from '../models/index.js'
import { signToken, AuthenticationError } from '../utils/auth.js';

interface AddUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
    }
}

interface LoginUserArgs {
    email: string;
    password: string;
}

interface UserArgs {
    username: string;
}

// interface BookArgs {
//     bookId: string;
// }

interface AddBookArgs {
    input: {
        bookId: string;
    }
}

// interface AddCommentArgs {
//     thoughtId: string;
//     commentText: string;
// }

// interface RemoveCommentArgs {
//     thoughtId: string;
//     commentId: string;
// }

const resolvers = {
    Query: {
        users: async () => {
            return User.find().populate('books');
        },
        user: async (_parent: any, { username }: UserArgs) => {
            return User.findOne({ username }).populate('books');
        },
        // books: async () => {
        //     return await User.savedBooks.find().sort({ createdAt: -1 });
        // },
        // book: async (_parent: any, { bookId }: BookArgs) => {
        //     return await User.savedBooks.findOne({ _id: bookId });
        // },
        // Query to get the authenticated user's information
        // The 'me' query relies on the context to check if the user is authenticated
        me: async (_parent: any, _args: any, context: any) => {
            // If the user is authenticated, find and return the user's information along with their thoughts
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('books');
            }
            // If the user is not authenticated, throw an AuthenticationError
            throw new AuthenticationError('Could not authenticate user.');
        },
    },
    Mutation: {
        addUser: async (_parent: any, { input }: AddUserArgs) => {
            // Create a new user with the provided username, email, and password
            const user = await User.create({ ...input });

            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);

            // Return the token and the user
            return { token, user };
        },

        login: async (_parent: any, { email, password }: LoginUserArgs) => {
            // Find a user with the provided email
            const user = await User.findOne({ email });

            // If no user is found, throw an AuthenticationError
            if (!user) {
                throw new AuthenticationError('Could not authenticate user.');
            }

            // Check if the provided password is correct
            const correctPw = await user.isCorrectPassword(password);

            // If the password is incorrect, throw an AuthenticationError
            if (!correctPw) {
                throw new AuthenticationError('Could not authenticate user.');
            }

            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);

            // Return the token and the user
            return { token, user };
        },
        addBook: async (_parent: any, { input }: AddBookArgs, context: any) => {
            if (context.user) {
                const book = await User.create({ ...input });

                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book._id } }
                );

                return book;
            }
            throw AuthenticationError;
            ('You need to be logged in!');
        },
        // addComment: async (_parent: any, { thoughtId, commentText }: AddCommentArgs, context: any) => {
        //     if (context.user) {
        //         return Thought.findOneAndUpdate(
        //             { _id: thoughtId },
        //             {
        //                 $addToSet: {
        //                     comments: { commentText, commentAuthor: context.user.username },
        //                 },
        //             },
        //             {
        //                 new: true,
        //                 runValidators: true,
        //             }
        //         );
        //     }
        //     throw AuthenticationError;
        // },
        // removeThought: async (_parent: any, { thoughtId }: ThoughtArgs, context: any) => {
        //     if (context.user) {
        //         const thought = await Thought.findOneAndDelete({
        //             _id: thoughtId,
        //             thoughtAuthor: context.user.username,
        //         });

        //         if (!thought) {
        //             throw AuthenticationError;
        //         }

        //         await User.findOneAndUpdate(
        //             { _id: context.user._id },
        //             { $pull: { thoughts: thought._id } }
        //         );

        //         return thought;
        //     }
        //     throw AuthenticationError;
        // },
        // removeComment: async (_parent: any, { thoughtId, commentId }: RemoveCommentArgs, context: any) => {
        //     if (context.user) {
        //         return Thought.findOneAndUpdate(
        //             { _id: thoughtId },
        //             {
        //                 $pull: {
        //                     comments: {
        //                         _id: commentId,
        //                         commentAuthor: context.user.username,
        //                     },
        //                 },
        //             },
        //             { new: true }
        //         );
        //     }
        //     throw AuthenticationError;
        // },
    },
};

export default resolvers;
