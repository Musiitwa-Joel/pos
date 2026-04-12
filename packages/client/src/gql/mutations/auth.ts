import { gql } from '@apollo/client/core';

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

export const GOOGLE_LOGIN = gql`
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken)
  }
`;

export const GOOGLE_REGISTER_INSTITUTION = gql`
  mutation GoogleRegisterInstitution($name: String!, $location: String!, $phone: String!, $email: String!) {
    googleRegisterInstitution(name: $name, location: $location, phone: $phone, email: $email) {
      id
      db_name
    }
  }
`;

export const GOOGLE_DECOMMISSION_REGISTRY = gql`
  mutation GoogleDecommissionRegistry($tenantId: String!) {
    googleDecommissionRegistry(tenantId: $tenantId)
  }
`;

export const GOOGLE_FINALIZE_PROVISIONING = gql`
  mutation GoogleFinalizeProvisioning($tenantId: String!, $password: String!) {
    googleFinalizeProvisioning(tenantId: $tenantId, password: $password)
  }
`;

export const INITIALIZE_USER_DB = gql`
  mutation InitializeUserDatabase {
    initializeUserDatabase
  }
`;
