import { ApolloServer, gql, UserInputError } from "apollo-server";
import { v1 as uuid } from "uuid";
import axios from "axios";

const persons = [
  {
    age: 23,
    name: "Midu",
    street: "calle tal",
    city: "barcelona",
    id: "1",
  },
  {
    age: 16,
    name: "blas",
    phone: "78687678",
    street: "calle tal",
    city: "pitalito",
    id: "2",
  },
  {
    age: 19,
    name: "carlos",
    phone: "78687678",
    street: "calle tal",
    city: "florencia",
    id: "3",
  },
];

const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person]!
    allPersonsPhone(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    findPersonById(id: ID!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      city: String!
      street: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    allPersonsPhone: async (root, args) => {

      // const {data: personsFromRestApi} = await axios.get('https://rickandmortyapi.com/api/character')
      const {data: personsFromRestApi} = await axios.get('http://localhost:3000/persons')
      console.log("hola",
      personsFromRestApi);

      if (!args.phone) return persons;
      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;

      return persons.filter(byPhone);
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
    findPersonById: (root, args) => {
      const { id } = args;
      return persons.find((person) => person.id === id);
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });
      }
      // const {name, phone, street, city} = args
      const person = { ...args, id: uuid() };
      persons.push(person); // updatedatabase with new person
      return person;
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if (personIndex === -1) return null;

      const person = persons[personIndex];

      const updatePerson = { ...person, phone: args.phone };
      persons[personIndex] = updatePerson;
      return updatePerson;
    },
  },
  Person: {
    address: (root) => {
      return {
        city: root.city,
        street: root.street,
      };
    },
  },
  // Person: {
  //   canDrink: (root) => root.age >= 18,
  //   address: (root) => `${root.street}, ${root.city}`,
  // },
};

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`server rady at ${url}`);
});
