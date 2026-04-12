import { gql } from '@apollo/client';

export const ADD_EMPLOYEE = gql`
  mutation AddEmployee($name: String!, $role: String!, $phone: String!, $email: String, $salary: Float!, $status: String) {
    addEmployee(name: $name, role: $role, phone: $phone, email: $email, salary: $salary, status: $status) {
      id
      name
      role
      phone
      email
      salary
      status
      joinedDate
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $name: String, $role: String, $phone: String, $email: String, $salary: Float, $status: String) {
    updateEmployee(id: $id, name: $name, role: $role, phone: $phone, email: $email, salary: $salary, status: $status) {
      id
      name
      role
      status
    }
  }
`;

export const RECORD_ATTENDANCE = gql`
  mutation RecordAttendance($employeeId: ID!, $checkIn: String!, $checkOut: String, $status: String) {
    recordAttendance(employeeId: $employeeId, checkIn: $checkIn, checkOut: $checkOut, status: $status) {
      id
      employeeId
      date
      status
    }
  }
`;

export const INITIALIZE_HR_DB = gql`
  mutation InitializeHRDatabase {
    initializeHRDatabase
  }
`;
