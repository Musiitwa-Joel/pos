import { gql } from "@apollo/client";

export const GET_ALL_INSTITUTIONS_HQ = gql`
  query GetAllInstitutionsHq {
    allInstitutionsHq {
      id
      name
      physicalLocation
      supportEmail
      supportPhone
      dbName
      ownerEmail
      paymentStatus
      status
      createdAt
      lastPayment {
        id
        amount
        paymentDate
      }
      operators {
        id
        username
        role
      }
      totalStaff
      storageUsage
      pulseVelocity
      complianceScore
      lastSaleAt
      plan {
        id
        name
        monthlyFee
        features
      }
    }
  }
`;

export const GET_BILLING_PLANS = gql`
  query GetBillingPlans {
    billingPlans {
      id
      name
      monthlyFee
      features
    }
  }
`;

export const RECORD_SYSTEM_PAYMENT = gql`
  mutation RecordSystemPayment($payload: SystemPaymentInput!) {
    recordSystemPayment(payload: $payload) {
      id
      amount
      paymentDate
      periodLabel
    }
  }
`;

export const SEND_BILLING_REMINDER = gql`
  mutation SendBillingReminder($tenantId: String!) {
    sendBillingReminder(tenantId: $tenantId)
  }
`;

export const UPDATE_INSTITUTION_STATUS = gql`
  mutation UpdateInstitutionStatus($id: ID!, $status: String!) {
    updateInstitutionStatus(id: $id, status: $status)
  }
`;

export const UPDATE_MASTER_PRICING = gql`
  mutation UpdateMasterPricing($monthlyFee: Float!) {
    updateMasterPricing(monthlyFee: $monthlyFee) {
      id
      name
      monthlyFee
    }
  }
`;

export const GET_REGISTRY_SETTINGS = gql`
  query GetRegistrySettings {
    getRegistrySettings {
      key
      value
    }
  }
`;

export const UPDATE_REGISTRY_SETTING = gql`
  mutation UpdateRegistrySetting($key: String!, $value: String!) {
    updateRegistrySetting(key: $key, value: $value)
  }
`;

export const FORCE_REGISTRY_SYNC = gql`
  mutation ForceRegistrySync {
    forceRegistrySync
  }
`;
