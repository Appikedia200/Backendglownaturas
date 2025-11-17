/**
 * OrderStatus Value Object
 * Immutable representation of order status with validation
 * @version 5.1.0
 */
class OrderStatus {
  static PENDING = 'pending';
  static CONFIRMED = 'confirmed';
  static PROCESSING = 'processing';
  static SHIPPED = 'shipped';
  static DELIVERED = 'delivered';
  static CANCELLED = 'cancelled';

  static VALID_STATUSES = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  /**
   * Valid status transitions
   */
  static TRANSITIONS = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  /**
   * @param {string} status
   */
  constructor(status) {
    if (!OrderStatus.isValid(status)) {
      throw new Error(`Invalid order status: ${status}`);
    }

    this._status = status;
    Object.freeze(this); // Make immutable
  }

  get value() {
    return this._status;
  }

  /**
   * Check if status is pending
   * @returns {boolean}
   */
  isPending() {
    return this._status === OrderStatus.PENDING;
  }

  /**
   * Check if status is confirmed
   * @returns {boolean}
   */
  isConfirmed() {
    return this._status === OrderStatus.CONFIRMED;
  }

  /**
   * Check if status is processing
   * @returns {boolean}
   */
  isProcessing() {
    return this._status === OrderStatus.PROCESSING;
  }

  /**
   * Check if status is shipped
   * @returns {boolean}
   */
  isShipped() {
    return this._status === OrderStatus.SHIPPED;
  }

  /**
   * Check if status is delivered
   * @returns {boolean}
   */
  isDelivered() {
    return this._status === OrderStatus.DELIVERED;
  }

  /**
   * Check if status is cancelled
   * @returns {boolean}
   */
  isCancelled() {
    return this._status === OrderStatus.CANCELLED;
  }

  /**
   * Check if status is final (cannot be changed)
   * @returns {boolean}
   */
  isFinal() {
    return this.isDelivered() || this.isCancelled();
  }

  /**
   * Check if can transition to new status
   * @param {string|OrderStatus} newStatus
   * @returns {boolean}
   */
  canTransitionTo(newStatus) {
    const targetStatus = newStatus instanceof OrderStatus ? newStatus.value : newStatus;
    const allowedTransitions = OrderStatus.TRANSITIONS[this._status] || [];
    return allowedTransitions.includes(targetStatus);
  }

  /**
   * Validate transition
   * @param {string|OrderStatus} newStatus
   * @throws {Error} If transition is invalid
   */
  validateTransition(newStatus) {
    const targetStatus = newStatus instanceof OrderStatus ? newStatus.value : newStatus;
    
    if (!this.canTransitionTo(targetStatus)) {
      throw new Error(
        `Invalid status transition from ${this._status} to ${targetStatus}`
      );
    }
  }

  /**
   * Check equality
   * @param {OrderStatus} other
   * @returns {boolean}
   */
  equals(other) {
    return this._status === other._status;
  }

  /**
   * Convert to string
   * @returns {string}
   */
  toString() {
    return this._status;
  }

  /**
   * Convert to plain value
   * @returns {string}
   */
  toJSON() {
    return this._status;
  }

  /**
   * Validate status
   * @param {string} status
   * @returns {boolean}
   */
  static isValid(status) {
    return OrderStatus.VALID_STATUSES.includes(status);
  }

  /**
   * Create from string
   * @param {string} status
   * @returns {OrderStatus}
   */
  static from(status) {
    return new OrderStatus(status);
  }

  /**
   * Create pending status
   * @returns {OrderStatus}
   */
  static createPending() {
    return new OrderStatus(OrderStatus.PENDING);
  }

  /**
   * Create confirmed status
   * @returns {OrderStatus}
   */
  static createConfirmed() {
    return new OrderStatus(OrderStatus.CONFIRMED);
  }
}

module.exports = OrderStatus;

