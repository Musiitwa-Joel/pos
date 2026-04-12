export default `
  type Employee {
    id: ID!
    name: String!
    role: String!
    phone: String!
    email: String
    salary: Float!
    status: String!
    joinedDate: String!
    createdAt: String
    updatedAt: String
  }

  type Attendance {
    id: ID!
    employeeId: ID!
    date: String!
    checkIn: String!
    checkOut: String
    status: String!
  }

  type PayrollRecord {
    id: ID!
    employeeId: ID!
    periodMonth: Int!
    periodYear: Int!
    grossSalary: Float!
    taxDeductions: Float!
    netSalary: Float!
    processedAt: String
  }

  extend type Query {
    employees: [Employee!]!
    employee(id: ID!): Employee
    attendanceLogs(employeeId: ID): [Attendance!]!
    payrollRecords(employeeId: ID): [PayrollRecord!]!
  }

  extend type Mutation {
    addEmployee(
      name: String!
      role: String!
      phone: String!
      email: String
      salary: Float!
      status: String
    ): Employee!

    updateEmployee(
      id: ID!
      name: String
      role: String
      phone: String
      email: String
      salary: Float
      status: String
    ): Employee!

    recordAttendance(
      employeeId: ID!
      checkIn: String!
      checkOut: String
      status: String
    ): Attendance!

    initializeHRDatabase: String!
  }
`;
