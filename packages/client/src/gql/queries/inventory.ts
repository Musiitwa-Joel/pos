import { gql } from '@apollo/client';

export const GET_SALES = gql`
  query GetSales($startDate: String, $endDate: String, $search: String) {
    sales(startDate: $startDate, endDate: $endDate, search: $search) {
      id
      total
      subtotal
      discount
      paymentMethod
      customerId
      cashierId
      shiftId
      cashierName
      promoId
      promoName
      createdAt
      items {
        id
        saleId
        productId
        productName
        quantity
        returnedQuantity
        unitPrice
        costPrice
        remainingStock
      }
    }
  }
`;

export const GET_SUPPLIERS = gql`
  query GetSuppliers {
    suppliers {
      id
      name
      contact
      phone
      email
      balance
      totalOrders
      lastDelivery
      reliabilityScore
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      category
      price
      costPrice
      stock
      minStock
      unit
      barcode
      supplierId
      createdAt
      updatedAt
      lastSaleDate
      daysSinceLastSale
    }
  }
`;

export const GET_INVENTORY_TRANSACTIONS = gql`
  query GetInventoryTransactions($productId: ID, $startDate: String, $endDate: String) {
    inventoryTransactions(productId: $productId, startDate: $startDate, endDate: $endDate) {
      id
      productId
      type
      quantity
      unitCost
      referenceId
      notes
      createdBy
      createdAt
    }
  }
`;

export const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      id
      name
      phone
      email
      creditLimit
      balance
      guarantorInfo
      lastPaymentDate
      createdAt
      updatedAt
    }
  }
`;

export const GET_CUSTOMER_PAYMENTS = gql`
  query GetCustomerPayments($customerId: ID!) {
    customerPayments(customerId: $customerId) {
      id
      customerId
      amount
      paymentMethod
      reference
      notes
      recordedBy
      shiftId
      createdAt
    }
  }
`;

export const GET_ALL_CUSTOMER_PAYMENTS = gql`
  query GetAllCustomerPayments($startDate: String, $endDate: String) {
    allCustomerPayments(startDate: $startDate, endDate: $endDate) {
      id
      customerId
      amount
      paymentMethod
      reference
      notes
      recordedBy
      shiftId
      createdAt
    }
  }
`;

export const GET_DAILY_DEBT_RECOVERED = gql`
  query GetDailyDebtRecovered {
    dailyDebtRecovered
  }
`;

export const GET_EXPENSES = gql`
  query GetExpenses($startDate: String, $endDate: String, $search: String) {
    expenses(startDate: $startDate, endDate: $endDate, search: $search) {
      id
      category
      amount
      description
      date
      authorizedBy
      createdAt
    }
  }
`;

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($startDate: String, $endDate: String) {
    auditLogs(startDate: $startDate, endDate: $endDate) {
      id
      userId
      action
      target
      oldValue
      newValue
      createdAt
      user {
        username
      }
    }
  }
`;

export const GET_SALE_RETURNS = gql`
  query GetSaleReturns($startDate: String, $endDate: String) {
    saleReturns(startDate: $startDate, endDate: $endDate) {
      id
      saleId
      productId
      quantity
      amount
      reason
      authorizedBy
      shiftId
      createdAt
    }
  }
`;

export const GET_CASHIER_SHIFTS = gql`
  query GetCashierShifts($startDate: String, $endDate: String) {
    cashierShifts(startDate: $startDate, endDate: $endDate) {
      id
      cashierId
      startTime
      endTime
      openingCash
      expectedCash
      actualCash
      variance
      status
      shiftId
      cashierName
      digitalTotal
      creditTotal
      recoveryTotal
      refundsTotal
    }
  }
`;

export const GET_ACTIVE_SHIFT = gql`
  query GetActiveShift($cashierId: ID!) {
    activeShift(cashierId: $cashierId) {
      id
      cashierId
      startTime
      openingCash
      status
    }
  }
`;

export const GET_PROFIT_REPORT = gql`
  query GetProfitReport($startDate: String!, $endDate: String!) {
    getProfitReport(startDate: $startDate, endDate: $endDate) {
      dateTrends {
        date
        revenue
        cost
        profit
      }
      productPerformance {
        id
        name
        qty
        revenue
        cost
        profit
      }
    }
  }
`;

export const GET_PROMOTIONS = gql`
  query GetPromotions {
    promotions {
      id
      name
      type
      value
      startDate
      endDate
      isActive
      productIds
      createdAt
      updatedAt
    }
  }
`;

export const GET_SHIFT_EXPECTED = gql`
  query GetShiftExpected($id: ID!) {
    getShiftExpected(id: $id) {
      id
      cashierId
      startTime
      openingCash
      expectedCash
      recoveryTotal
      refundsTotal
      status
    }
  }
`;

export const GET_HELD_SALES = gql`
  query GetHeldSales {
    heldSales {
      id
      cart
      customerId
      discount
      cashierId
      createdAt
    }
  }
`;
