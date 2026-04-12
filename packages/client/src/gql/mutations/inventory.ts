import { gql } from '@apollo/client';

export const ADD_SUPPLIER = gql`
  mutation AddSupplier($name: String!, $contact: String, $phone: String, $email: String) {
    addSupplier(name: $name, contact: $contact, phone: $phone, email: $email) {
      id
      name
      contact
      phone
      email
      balance
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier($id: ID!, $name: String, $contact: String, $phone: String, $email: String, $balance: Float) {
    updateSupplier(id: $id, name: $name, contact: $contact, phone: $phone, email: $email, balance: $balance) {
      id
      name
      contact
      phone
      email
      balance
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SUPPLIER = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id)
  }
`;

export const INITIALIZE_INVENTORY_DB = gql`
  mutation InitializeInventoryDatabase {
    initializeInventoryDatabase
  }
`;

export const ADD_PRODUCT = gql`
  mutation AddProduct($name: String!, $category: String, $price: Float!, $costPrice: Float!, $initialStock: Int, $minStock: Int, $unit: String!, $barcode: String, $supplierId: ID) {
    addProduct(name: $name, category: $category, price: $price, costPrice: $costPrice, initialStock: $initialStock, minStock: $minStock, unit: $unit, barcode: $barcode, supplierId: $supplierId) {
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
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $name: String, $category: String, $price: Float, $costPrice: Float, $minStock: Int, $unit: String, $barcode: String, $supplierId: ID) {
    updateProduct(id: $id, name: $name, category: $category, price: $price, costPrice: $costPrice, minStock: $minStock, unit: $unit, barcode: $barcode, supplierId: $supplierId) {
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
    }
  }
`;

export const ADJUST_STOCK = gql`
  mutation AdjustStock($productId: ID!, $quantity: Int!, $type: String!, $notes: String) {
    adjustStock(productId: $productId, quantity: $quantity, type: $type, notes: $notes) {
      id
      stock
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const ADD_SALE = gql`
  mutation AddSale($total: Float!, $subtotal: Float!, $tax: Float, $discount: Float, $paymentMethod: String!, $customerId: ID, $cashierId: ID, $shiftId: ID, $promoId: String, $promoName: String, $clientTxId: String, $items: [SaleItemInput!]!) {
    addSale(total: $total, subtotal: $subtotal, tax: $tax, discount: $discount, paymentMethod: $paymentMethod, customerId: $customerId, cashierId: $cashierId, shiftId: $shiftId, promoId: $promoId, promoName: $promoName, clientTxId: $clientTxId, items: $items) {
      id
      total
      subtotal
      discount
      paymentMethod
      cashierId
      shiftId
      cashierName
      promoId
      promoName
      createdAt
      items {
        id
        productId
        productName
        quantity
        unitPrice
        remainingStock
      }
    }
  }
`;

export const ADD_CUSTOMER = gql`
  mutation AddCustomer($name: String!, $phone: String, $email: String, $creditLimit: Float, $guarantorInfo: String) {
    addCustomer(name: $name, phone: $phone, email: $email, creditLimit: $creditLimit, guarantorInfo: $guarantorInfo) {
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

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $name: String, $phone: String, $email: String, $creditLimit: Float, $guarantorInfo: String) {
    updateCustomer(id: $id, name: $name, phone: $phone, email: $email, creditLimit: $creditLimit, guarantorInfo: $guarantorInfo) {
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

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

export const RECORD_PAYMENT = gql`
  mutation RecordPayment($customerId: ID!, $amount: Float!, $paymentMethod: String, $reference: String, $notes: String) {
    recordPayment(customerId: $customerId, amount: $amount, paymentMethod: $paymentMethod, reference: $reference, notes: $notes) {
      id
      customerId
      amount
      paymentMethod
      reference
      notes
      recordedBy
      createdAt
    }
  }
`;

export const DELETE_CUSTOMER_PAYMENT = gql`
  mutation DeleteCustomerPayment($id: ID!) {
    deleteCustomerPayment(id: $id)
  }
`;

export const ADD_EXPENSE = gql`
  mutation AddExpense($category: String!, $amount: Float!, $description: String, $date: String) {
    addExpense(category: $category, amount: $amount, description: $description, date: $date) {
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

export const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;

export const ADD_SYSTEM_LOG = gql`
  mutation AddSystemLog($action: String!, $target: String!, $oldValue: String, $newValue: String) {
    addSystemLog(action: $action, target: $target, oldValue: $oldValue, newValue: $newValue) {
      id
      action
      target
      createdAt
    }
  }
`;

export const RECORD_RETURN = gql`
  mutation RecordReturn($saleId: ID!, $productId: ID!, $quantity: Int!, $amount: Float!, $reason: String, $shiftId: ID, $date: String) {
    recordReturn(saleId: $saleId, productId: $productId, quantity: $quantity, amount: $amount, reason: $reason, shiftId: $shiftId, date: $date) {
      id
      saleId
      productId
      quantity
      amount
      shiftId
      createdAt
    }
  }
`;

export const OPEN_SHIFT = gql`
  mutation OpenShift($openingCash: Float!) {
    openShift(openingCash: $openingCash) {
      id
      cashierId
      startTime
      openingCash
      status
    }
  }
`;

export const CLOSE_SHIFT = gql`
  mutation CloseShift($id: ID!, $actualCash: Float!) {
    closeShift(id: $id, actualCash: $actualCash) {
      id
      endTime
      expectedCash
      actualCash
      variance
      status
    }
  }
`;

export const ADD_PROMOTION = gql`
  mutation AddPromotion($name: String!, $type: String!, $value: Float!, $startDate: String!, $endDate: String!, $productIds: [ID!]) {
    addPromotion(name: $name, type: $type, value: $value, startDate: $startDate, endDate: $endDate, productIds: $productIds) {
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

export const UPDATE_PROMOTION = gql`
  mutation UpdatePromotion($id: ID!, $name: String, $type: String, $value: Float, $startDate: String, $endDate: String, $isActive: Boolean, $productIds: [ID!]) {
    updatePromotion(id: $id, name: $name, type: $type, value: $value, startDate: $startDate, endDate: $endDate, isActive: $isActive, productIds: $productIds) {
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

export const DELETE_PROMOTION = gql`
  mutation DeletePromotion($id: ID!) {
    deletePromotion(id: $id)
  }
`;

export const TOGGLE_PROMOTION = gql`
  mutation TogglePromotion($id: ID!) {
    togglePromotion(id: $id) {
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
