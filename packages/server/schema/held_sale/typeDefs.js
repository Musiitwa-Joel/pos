export default `
  type HeldSale {
    id: ID!
    cart: String!
    customerId: String
    discount: Float
    cashierId: String!
    createdAt: String!
  }

  extend type Query {
    heldSales: [HeldSale!]!
  }

  extend type Mutation {
    holdSale(
      cart: String!
      customerId: String
      discount: Float
      cashierId: String!
    ): HeldSale!

    deleteHeldSale(id: ID!): Boolean!
  }
`;
