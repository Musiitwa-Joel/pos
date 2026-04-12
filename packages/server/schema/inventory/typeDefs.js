export default `
  type Product {
    id: ID!
    name: String!
    category: String
    price: Float!
    costPrice: Float!
    stock: Int!
    minStock: Int!
    unit: String!
    barcode: String
    supplierId: ID
    createdAt: String
    updatedAt: String
    lastSaleDate: String
    daysSinceLastSale: Int
  }

  type InventoryTransaction {
    id: ID!
    productId: ID!
    type: String!
    quantity: Int!
    unitCost: Float
    referenceId: String
    notes: String
    createdBy: ID
    createdAt: String
  }

  type Sale {
    id: ID!
    total: Float!
    subtotal: Float!
    tax: Float
    discount: Float
    paymentMethod: String!
    customerId: ID
    cashierId: ID
    shiftId: ID
    cashierName: String
    promoId: String
    promoName: String
    createdAt: String
    items: [SaleItem!]!
  }

  type SaleItem {
    id: ID!
    saleId: ID!
    productId: ID!
    quantity: Int!
    returnedQuantity: Int
    unitPrice: Float!
    costPrice: Float
    productName: String
    remainingStock: Int
  }

  type SaleReturn {
    id: ID!
    saleId: ID!
    productId: ID!
    quantity: Int!
    amount: Float!
    reason: String
    authorizedBy: ID
    shiftId: ID
    createdAt: String
  }

  input SaleItemInput {
    id: ID!
    name: String
    quantity: Int!
    price: Float!
  }
  type Supplier {
    id: ID!
    name: String!
    contact: String
    phone: String
    email: String
    balance: Float!
    totalOrders: Int!
    lastDelivery: String
    reliabilityScore: Float!
    createdAt: String
    updatedAt: String
  }

  type Customer {
    id: ID!
    name: String!
    phone: String
    email: String
    creditLimit: Float!
    balance: Float!
    guarantorInfo: String
    lastPaymentDate: String
    createdAt: String
    updatedAt: String
  }

  type CustomerPayment {
    id: ID!
    customerId: ID!
    amount: Float!
    paymentMethod: String
    reference: String
    notes: String
    recordedBy: ID
    shiftId: ID
    createdAt: String
  }

  extend type Query {
    products: [Product!]!
    product(id: ID!): Product
    inventoryTransactions(productId: ID, startDate: String, endDate: String): [InventoryTransaction!]!
    suppliers: [Supplier!]!
    supplier(id: ID!): Supplier
    sales(startDate: String, endDate: String, search: String): [Sale!]!
    customers: [Customer!]!
    promotions: [Promotion!]!
    customer(id: ID!): Customer
    customerPayments(customerId: ID!): [CustomerPayment!]!
    dailyDebtRecovered: Float!
    expenses(startDate: String, endDate: String, search: String): [Expense!]!
  }

  extend type Mutation {
    addProduct(
      name: String!
      category: String
      price: Float!
      costPrice: Float!
      initialStock: Int
      minStock: Int
      unit: String!
      barcode: String
      supplierId: ID
    ): Product!

    updateProduct(
      id: ID!
      name: String
      category: String
      price: Float
      costPrice: Float
      minStock: Int
      unit: String
      barcode: String
      supplierId: ID
    ): Product!

    adjustStock(
      productId: ID!
      quantity: Int!
      type: String!
      notes: String
    ): Product!

    deleteProduct(id: ID!): String!

    addSupplier(
      name: String!
      contact: String
      phone: String
      email: String
    ): Supplier!

    updateSupplier(
      id: ID!
      name: String
      contact: String
      phone: String
      email: String
      balance: Float
    ): Supplier!

    deleteSupplier(id: ID!): String!

    addSale(
      total: Float!
      subtotal: Float!
      tax: Float
      discount: Float
      paymentMethod: String!
      customerId: ID
      cashierId: ID
      shiftId: ID
      promoId: String
      promoName: String
      clientTxId: String
      items: [SaleItemInput!]!
    ): Sale!

    initializeInventoryDatabase: String!

    addCustomer(
      name: String!
      phone: String
      email: String
      creditLimit: Float
      guarantorInfo: String
    ): Customer!

    updateCustomer(
      id: ID!
      name: String
      phone: String
      email: String
      creditLimit: Float
      guarantorInfo: String
      balance: Float
    ): Customer!

    deleteCustomer(id: ID!): String!
    
    recordPayment(
      customerId: ID!
      amount: Float!
      paymentMethod: String
      reference: String
      notes: String
      shiftId: ID
    ): CustomerPayment!

    deleteCustomerPayment(id: ID!): Boolean
    
    addExpense(
      category: String!
      amount: Float!
      description: String
      date: String
    ): Expense!

    deleteExpense(id: ID!): String!

    # Reporting & Audit Mutations
    addSystemLog(
      action: String!
      target: String!
      oldValue: String
      newValue: String
    ): AuditLog!

    recordReturn(
      saleId: ID!
      productId: ID!
      quantity: Int!
      amount: Float!
      reason: String
      shiftId: ID
      date: String
    ): SaleReturn!

    openShift(openingCash: Float!): CashierShift!
    closeShift(id: ID!, actualCash: Float!): CashierShift!

    addPromotion(
      name: String!
      type: String!
      value: Float!
      startDate: String!
      endDate: String!
      productIds: [ID!]
    ): Promotion!

    updatePromotion(
      id: ID!
      name: String
      type: String
      value: Float
      startDate: String
      endDate: String
      isActive: Boolean
      productIds: [ID!]
    ): Promotion!

    deletePromotion(id: ID!): String!
    togglePromotion(id: ID!): Promotion!
  }

  type Promotion {
    id: ID!
    name: String!
    type: String!
    value: Float!
    startDate: String!
    endDate: String!
    isActive: Boolean!
    productIds: [ID!]
    createdAt: String
    updatedAt: String
  }

  type AuditUser {
    username: String
  }

  type AuditLog {
    id: ID!
    userId: ID!
    user: AuditUser
    action: String!
    target: String!
    oldValue: String
    newValue: String
    createdAt: String
  }

  type CashierShift {
    id: ID!
    cashierId: ID!
    shiftId: ID
    startTime: String!
    endTime: String
    openingCash: Float!
    expectedCash: Float
    actualCash: Float
    variance: Float
    digitalTotal: Float
    creditTotal: Float
    recoveryTotal: Float
    refundsTotal: Float
    status: String # OPEN, CLOSED
    cashierName: String
  }

  type Expense {
    id: ID!
    category: String!
    amount: Float!
    description: String
    date: String!
    authorizedBy: String
    createdAt: String
  }

  type DateProfit {
    date: String!
    revenue: Float!
    cost: Float!
    profit: Float!
  }

  type ProductProfit {
    id: ID!
    name: String!
    qty: Int!
    revenue: Float!
    cost: Float!
    profit: Float!
  }

  type ProfitReport {
    dateTrends: [DateProfit!]!
    productPerformance: [ProductProfit!]!
  }

  extend type Query {
    auditLogs(startDate: String, endDate: String): [AuditLog!]!
    saleReturns(startDate: String, endDate: String): [SaleReturn!]!
    saleReturn(id: ID!): SaleReturn
    cashierShifts(startDate: String, endDate: String): [CashierShift!]!
    activeShift(cashierId: ID!): CashierShift
    getShiftExpected(id: ID!): CashierShift!
    allCustomerPayments(startDate: String, endDate: String): [CustomerPayment!]!
    getProfitReport(startDate: String!, endDate: String!): ProfitReport!
  }
`;
