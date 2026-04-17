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

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const VERIFY_PASSWORD_RESET_CODE = gql`
  mutation VerifyPasswordResetCode($email: String!, $code: String!) {
    verifyPasswordResetCode(email: $email, code: $code)
  }
`;

export const FINALIZE_PASSWORD_RESET = gql`
  mutation FinalizePasswordReset($email: String!, $code: String!, $newPassword: String!) {
    finalizePasswordReset(email: $email, code: $code, newPassword: $newPassword)
  }
`;
