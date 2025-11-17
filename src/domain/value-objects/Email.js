/**
 * Email Value Object
 * Immutable representation of email addresses with validation
 * @version 5.1.0
 */
class Email {
  /**
   * @param {string} address
   */
  constructor(address) {
    if (!Email.isValid(address)) {
      throw new Error('Invalid email address');
    }

    this._address = address.toLowerCase().trim();
    Object.freeze(this); // Make immutable
  }

  get address() {
    return this._address;
  }

  get domain() {
    return this._address.split('@')[1];
  }

  get localPart() {
    return this._address.split('@')[0];
  }

  /**
   * Check if belongs to specific domain
   * @param {string} domain
   * @returns {boolean}
   */
  belongsToDomain(domain) {
    return this.domain.toLowerCase() === domain.toLowerCase();
  }

  /**
   * Check equality
   * @param {Email} other
   * @returns {boolean}
   */
  equals(other) {
    return this._address === other._address;
  }

  /**
   * Convert to string
   * @returns {string}
   */
  toString() {
    return this._address;
  }

  /**
   * Convert to plain object
   * @returns {string}
   */
  toJSON() {
    return this._address;
  }

  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  static isValid(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return emailRegex.test(email.trim());
  }

  /**
   * Create from string
   * @param {string} address
   * @returns {Email}
   */
  static from(address) {
    return new Email(address);
  }
}

module.exports = Email;

