export const typeDefs = `#graphql
  enum ComponentStatus {
    OPERATIONAL
    DEGRADED
    PARTIAL_OUTAGE
    MAJOR_OUTAGE
  }

  enum IncidentStatus {
    INVESTIGATING
    IDENTIFIED
    MONITORING
    RESOLVED
  }

  enum IncidentImpact {
    NONE
    MINOR
    MAJOR
    CRITICAL
  }

  type StatusComponent {
    id: ID!
    name: String!
    description: String
    status: ComponentStatus!
    order_index: Int
    created_at: String
  }

  type StatusIncident {
    id: ID!
    title: String!
    message: String!
    status: IncidentStatus!
    impact: IncidentImpact!
    created_at: String
    updated_at: String
  }

  input StatusComponentInput {
    id: ID
    name: String!
    description: String
    status: ComponentStatus!
    order_index: Int
  }

  input StatusIncidentInput {
    id: ID
    title: String!
    message: String!
    status: IncidentStatus!
    impact: IncidentImpact!
  }

  extend type Query {
    getStatusComponents: [StatusComponent]
    getActiveIncidents: [StatusIncident]
    getIncidentHistory(limit: Int): [StatusIncident]
  }

  extend type Mutation {
    upsertStatusComponent(input: StatusComponentInput!): StatusComponent
    deleteStatusComponent(id: ID!): Boolean
    upsertStatusIncident(input: StatusIncidentInput!): StatusIncident
    deleteStatusIncident(id: ID!): Boolean
  }
`;
