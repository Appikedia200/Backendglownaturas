/**
 * Money Value Object
 * Immutable representation of monetary values
 * @version 5.1.0
 */
class Money {
  /**
   * @param {number} amount
   * @param {string} currency
   */
  constructor(amount, currency = 'NGN') {
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }

    if (typeof currency !== 'string' || currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code');
    }

    this._amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
    this._currency = currency.toUpperCase();

    Object.freeze(this); // Make immutable
  }

  get amount() {
    return this._amount;
  }

  get currency() {
    return this._currency;
  }

  /**
   * Add money
   * @param {Money} other
   * @returns {Money}
   */
  add(other) {
    this._assertSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  /**
   * Subtract money
   * @param {Money} other
   * @returns {Money}
   */
  subtract(other) {
    this._assertSameCurrency(other);
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error('Cannot subtract to negative amount');
    }
    return new Money(result, this._currency);
  }

  /**
   * Multiply by factor
   * @param {number} factor
   * @returns {Money}
   */
  multiply(factor) {
    if (typeof factor !== 'number' || factor < 0) {
      throw new Error('Factor must be a non-negative number');
    }
    return new Money(this._amount * factor, this._currency);
  }

  /**
   * Check equality
   * @param {Money} other
   * @returns {boolean}
   */
  equals(other) {
    return this._amount === other._amount && this._currency === other._currency;
  }

  /**
   * Check if greater than
   * @param {Money} other
   * @returns {boolean}
   */
  greaterThan(other) {
    this._assertSameCurrency(other);
    return this._amount > other._amount;
  }

  /**
   * Format as string
   * @returns {string}
   */
  toString() {
    return `${this._currency} ${this._amount.toLocaleString()}`;
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      amount: this._amount,
      currency: this._currency
    };
  }

  /**
   * Assert same currency for operations
   * @private
   */
  _assertSameCurrency(other) {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot perform operation with different currencies: ${this._currency} and ${other._currency}`);
    }
  }

  /**
   * Create from plain object
   * @param {Object} data
   * @returns {Money}
   */
  static fromObject(data) {
    return new Money(data.amount, data.currency);
  }
}

module.exports = Money;

