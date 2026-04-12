import { gql } from '@apollo/client';

export const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
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

export const GET_ATTENDANCE = gql`
  query GetAttendance($employeeId: ID) {
    attendanceLogs(employeeId: $employeeId) {
      id
      employeeId
      date
      checkIn
      checkOut
      status
    }
  }
`;
