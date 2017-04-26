const graphql = require('graphql');
//const _ = require('lodash');
const axios = require('axios');


const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;




//const users = [
//    {id: '23', firstName: 'Bill', age:20},
//    {id: '47', firstName: 'Bill', age:21}
//];


const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(res => res.data)
            }

        }

    })
}) 


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: GraphQLString},
        firstName: {type: GraphQLString},
        age: {type: GraphQLInt},
        company: {
            type: CompanyType,
            resolve(parentValue, args){
                console.log(parentValue, args);
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data)
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',

    // This means: You can ask app the root query, users
    // If you give app the ID of a user --> will return user back
    fields: {
        user: {
            type: UserType,
            args: {id: {type: GraphQLString} },
            resolve(parentValue, args) {
               //return _.find(users, {id: args.id});
               return axios.get(`http://localhost:3000/users/${args.id}`)
                .then(resp => resp.data); //pare down response object to just data
            }
        },
        company: {
            type: CompanyType,
            args: {id: {type: GraphQLString}},
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(resp => resp.data)
            }
        }


    }
});



const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
                companyId: {type: GraphQLString}
            },
            resolve(parentValue, {firstName, age}) {
                return axios.post(`http://localhost:3000/users`, {firstName, age})
                    .then(res => res.data);
            }
        }
    }
})







module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: mutation

});