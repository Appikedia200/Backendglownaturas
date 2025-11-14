module.exports = {
  order_pending: {
    name: 'Order Pending - Payment Required',
    subject: 'Order Received - Payment Pending #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">GLOWNATURA</h1>
              <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Premium Skincare</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Order Confirmation</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear {CUSTOMER_NAME},
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for your order. Your order has been received and is currently on-hold until we confirm payment has been received.
              </p>
              
              <!-- Order Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Order Number:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">{ORDER_ID}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Order Date:</td>
                        <td style="color: #1f2937; font-size: 14px; text-align: right; padding: 8px 0;">{ORDER_DATE}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Total Amount:</td>
                        <td style="color: #059669; font-size: 18px; font-weight: 700; text-align: right; padding: 8px 0;">{TOTAL}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Items Ordered -->
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Items Ordered</h3>
              {ITEMS_TABLE}
              
              <!-- Price Breakdown -->
              <table width="100%" cellpadding="10" cellspacing="0" style="border-top: 2px solid #e5e7eb; margin-top: 24px;">
                <tr>
                  <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Subtotal:</td>
                  <td style="color: #1f2937; font-size: 14px; text-align: right; padding: 8px 0;">{SUBTOTAL}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Shipping:</td>
                  <td style="color: #1f2937; font-size: 14px; text-align: right; padding: 8px 0;">{SHIPPING}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="color: #1f2937; font-size: 18px; font-weight: 600; padding-top: 16px;">Total:</td>
                  <td style="color: #059669; font-size: 18px; font-weight: 700; text-align: right; padding-top: 16px;">{TOTAL}</td>
                </tr>
              </table>
              
              <!-- Payment Instructions -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 24px; margin: 32px 0; border-radius: 4px;">
                <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Payment Instructions</h3>
                <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                  Please transfer <strong>{TOTAL}</strong> to our bank account:
                </p>
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr>
                    <td style="color: #92400e; font-size: 14px; font-weight: 600; width: 40%;">Bank Name:</td>
                    <td style="color: #92400e; font-size: 14px;">{BANK_NAME}</td>
                  </tr>
                  <tr>
                    <td style="color: #92400e; font-size: 14px; font-weight: 600;">Account Number:</td>
                    <td style="color: #92400e; font-size: 14px;">{ACCOUNT_NUMBER}</td>
                  </tr>
                  <tr>
                    <td style="color: #92400e; font-size: 14px; font-weight: 600;">Account Name:</td>
                    <td style="color: #92400e; font-size: 14px;">GlowNatura</td>
                  </tr>
                  <tr>
                    <td style="color: #92400e; font-size: 14px; font-weight: 600;">Reference:</td>
                    <td style="color: #92400e; font-size: 14px; font-weight: 700;">{ORDER_ID}</td>
                  </tr>
                </table>
                <p style="color: #92400e; font-size: 13px; margin: 16px 0 0 0; font-weight: 600;">
                  Important: Please use your order number as the payment reference. Your order will be automatically cancelled if payment is not received within 6 hours.
                </p>
              </div>
              
              <!-- Shipping Address -->
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Shipping Address</h3>
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; border: 1px solid #e5e7eb;">
                <p style="color: #1f2937; font-size: 14px; line-height: 1.8; margin: 0;">
                  {CUSTOMER_NAME}<br>
                  {SHIPPING_ADDRESS}<br>
                  {CITY}, {STATE}
                </p>
              </div>
              
              <!-- Contact Section -->
              <div style="margin-top: 32px; padding: 24px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Need Assistance?</h3>
                <p style="color: #15803d; font-size: 14px; line-height: 1.6; margin: 0;">
                  After completing payment, please contact us:<br>
                  WhatsApp: <a href="https://wa.me/{WHATSAPP_NUMBER}" style="color: #059669; text-decoration: none; font-weight: 600;">{WHATSAPP_NUMBER}</a><br>
                  Email: <a href="mailto:{STORE_EMAIL}" style="color: #059669; text-decoration: none; font-weight: 600;">{STORE_EMAIL}</a>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                Thank you for choosing GlowNatura
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                &copy; 2025 GlowNatura. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Order Confirmation

Dear {CUSTOMER_NAME},

Thank you for your order. Your order has been received and is currently on-hold until we confirm payment has been received.

ORDER DETAILS
Order Number: {ORDER_ID}
Order Date: {ORDER_DATE}
Total Amount: {TOTAL}

ITEMS ORDERED
{ITEMS_TEXT}

PRICE BREAKDOWN
Subtotal: {SUBTOTAL}
Shipping: {SHIPPING}
Total: {TOTAL}

PAYMENT INSTRUCTIONS
Please transfer {TOTAL} to our bank account:

Bank Name: {BANK_NAME}
Account Number: {ACCOUNT_NUMBER}
Account Name: GlowNatura
Reference: {ORDER_ID}

Important: Please use your order number as the payment reference. Your order will be automatically cancelled if payment is not received within 6 hours.

SHIPPING ADDRESS
{CUSTOMER_NAME}
{SHIPPING_ADDRESS}
{CITY}, {STATE}

NEED ASSISTANCE?
After completing payment, please contact us:
WhatsApp: {WHATSAPP_NUMBER}
Email: {STORE_EMAIL}

Thank you for choosing GlowNatura
© 2025 GlowNatura. All rights reserved.`,
    variables: [
      { name: 'CUSTOMER_NAME', description: 'Customer full name', example: 'John Doe' },
      { name: 'ORDER_ID', description: 'Order ID', example: 'GN-2025-001' },
      { name: 'ORDER_DATE', description: 'Order date', example: 'January 15, 2025' },
      { name: 'TOTAL', description: 'Order total', example: '₦25,000' },
      { name: 'SUBTOTAL', description: 'Subtotal', example: '₦22,500' },
      { name: 'SHIPPING', description: 'Shipping fee', example: '₦2,500' },
      { name: 'ITEMS_TABLE', description: 'HTML table of items', example: '<table>...</table>' },
      { name: 'ITEMS_TEXT', description: 'Plain text items list', example: '• Product 1 x 2 - ₦10,000' },
      { name: 'BANK_NAME', description: 'Bank name', example: 'First Bank Nigeria' },
      { name: 'ACCOUNT_NUMBER', description: 'Account number', example: '1234567890' },
      { name: 'SHIPPING_ADDRESS', description: 'Full address', example: '123 Main St, Apt 4B' },
      { name: 'CITY', description: 'City', example: 'Lagos' },
      { name: 'STATE', description: 'State', example: 'Lagos State' },
      { name: 'WHATSAPP_NUMBER', description: 'WhatsApp number', example: '+2348012345678' },
      { name: 'STORE_EMAIL', description: 'Store email', example: 'orders@glownatura.com' }
    ]
  },
  
  payment_confirmed: {
    name: 'Payment Confirmed - Order Processing',
    subject: 'Payment Confirmed - Order Processing #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">GLOWNATURA</h1>
              <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Premium Skincare</p>
            </td>
          </tr>
          
          <!-- Success Badge -->
          <tr>
            <td style="padding: 40px 40px 24px 40px; text-align: center;">
              <div style="background-color: #d1fae5; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px auto; display: inline-block; line-height: 80px; font-size: 40px; color: #059669; font-weight: 700;">✓</div>
              <h2 style="color: #059669; margin: 0 0 12px 0; font-size: 26px; font-weight: 600;">Payment Confirmed</h2>
              <p style="color: #4b5563; font-size: 16px; margin: 0;">Your order is now being processed</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear <strong>{CUSTOMER_NAME}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                We have successfully received your payment. Your order is now being prepared for shipment.
              </p>
              
              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Summary</h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Order Number:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">{ORDER_ID}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Payment Status:</td>
                        <td style="color: #059669; font-size: 14px; font-weight: 700; text-align: right; padding: 8px 0;">PAID</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Total Paid:</td>
                        <td style="color: #059669; font-size: 18px; font-weight: 700; text-align: right; padding: 8px 0;">{TOTAL}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Items -->
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Your Items</h3>
              {ITEMS_TABLE}
              
              <!-- Next Steps -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; margin: 32px 0; border-radius: 4px;">
                <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">What Happens Next?</h3>
                <p style="color: #1e3a8a; font-size: 14px; line-height: 1.8; margin: 0;">
                  <strong>1.</strong> We are preparing your items for shipment<br>
                  <strong>2.</strong> You will receive tracking information once your order ships<br>
                  <strong>3.</strong> Estimated delivery time: 3-5 business days
                </p>
              </div>
              
              <!-- Receipt Attached -->
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 4px; border: 1px solid #bbf7d0; text-align: center; margin: 24px 0;">
                <p style="color: #15803d; font-size: 14px; margin: 0; font-weight: 600;">
                  Official Receipt Attached
                </p>
                <p style="color: #166534; font-size: 13px; margin: 8px 0 0 0;">
                  Your official payment receipt is attached to this email
                </p>
              </div>
              
              <!-- Contact -->
              <div style="margin-top: 32px; padding: 24px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Questions or Concerns?</h3>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                  WhatsApp: <a href="https://wa.me/{WHATSAPP_NUMBER}" style="color: #059669; text-decoration: none; font-weight: 600;">{WHATSAPP_NUMBER}</a><br>
                  Email: <a href="mailto:{STORE_EMAIL}" style="color: #059669; text-decoration: none; font-weight: 600;">{STORE_EMAIL}</a>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                Thank you for choosing GlowNatura
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                &copy; 2025 GlowNatura. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Payment Confirmed - Order Processing

Dear {CUSTOMER_NAME},

We have successfully received your payment. Your order is now being prepared for shipment.

ORDER SUMMARY
Order Number: {ORDER_ID}
Payment Status: PAID
Total Paid: {TOTAL}

YOUR ITEMS
{ITEMS_TEXT}

WHAT HAPPENS NEXT?
1. We are preparing your items for shipment
2. You will receive tracking information once your order ships
3. Estimated delivery time: 3-5 business days

OFFICIAL RECEIPT
Your official payment receipt is attached to this email

QUESTIONS OR CONCERNS?
WhatsApp: {WHATSAPP_NUMBER}
Email: {STORE_EMAIL}

Thank you for choosing GlowNatura
© 2025 GlowNatura. All rights reserved.`,
    variables: [
      { name: 'CUSTOMER_NAME', description: 'Customer full name', example: 'John Doe' },
      { name: 'ORDER_ID', description: 'Order ID', example: 'GN-2025-001' },
      { name: 'TOTAL', description: 'Order total', example: '₦25,000' },
      { name: 'ITEMS_TABLE', description: 'HTML table of items', example: '<table>...</table>' },
      { name: 'ITEMS_TEXT', description: 'Plain text items list', example: '• Product 1 x 2 - ₦10,000' },
      { name: 'WHATSAPP_NUMBER', description: 'WhatsApp number', example: '+2348012345678' },
      { name: 'STORE_EMAIL', description: 'Store email', example: 'orders@glownatura.com' }
    ]
  },
  
  order_shipped_courier: {
    name: 'Order Shipped - Courier Service',
    subject: 'Your Order Has Been Shipped #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">GLOWNATURA</h1>
              <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Premium Skincare</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              
              <h2 style="color: #1f2937; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">Order Shipped</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear {CUSTOMER_NAME},
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Good news! Your order <strong>#{ORDER_ID}</strong> has been shipped and is on its way to you.
              </p>
              
              <!-- Tracking Details -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 24px; margin: 24px 0; border-radius: 4px;">
                <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Tracking Information</h3>
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr>
                    <td style="color: #15803d; font-size: 14px; font-weight: 600; width: 40%;">Courier Service:</td>
                    <td style="color: #15803d; font-size: 14px;">{CARRIER}</td>
                  </tr>
                  <tr>
                    <td style="color: #15803d; font-size: 14px; font-weight: 600;">Tracking Number:</td>
                    <td style="color: #15803d; font-size: 14px; font-weight: 700;">{TRACKING_NUMBER}</td>
                  </tr>
                  <tr>
                    <td style="color: #15803d; font-size: 14px; font-weight: 600;">Estimated Delivery:</td>
                    <td style="color: #15803d; font-size: 14px;">{ESTIMATED_DELIVERY}</td>
                  </tr>
                </table>
                
                <!-- Track Button -->
                <div style="margin-top: 20px; text-align: center;">
                  <a href="{TRACKING_URL}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Track Your Package</a>
                </div>
              </div>
              
              <!-- Items -->
              <h3 style="color: #1f2937; margin: 24px 0 16px 0; font-size: 18px; font-weight: 600;">Shipped Items</h3>
              {ITEMS_TABLE}
              
              <!-- Delivery Address -->
              <h3 style="color: #1f2937; margin: 24px 0 16px 0; font-size: 18px; font-weight: 600;">Delivery Address</h3>
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; border: 1px solid #e5e7eb;">
                <p style="color: #1f2937; font-size: 14px; line-height: 1.8; margin: 0;">
                  {CUSTOMER_NAME}<br>
                  {SHIPPING_ADDRESS}<br>
                  {CITY}, {STATE}
                </p>
              </div>
              
              <!-- Contact -->
              <div style="margin-top: 32px; padding: 24px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Need Assistance?</h3>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                  WhatsApp: <a href="https://wa.me/{WHATSAPP_NUMBER}" style="color: #059669; text-decoration: none; font-weight: 600;">{WHATSAPP_NUMBER}</a><br>
                  Email: <a href="mailto:{STORE_EMAIL}" style="color: #059669; text-decoration: none; font-weight: 600;">{STORE_EMAIL}</a>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                Thank you for choosing GlowNatura
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                &copy; 2025 GlowNatura. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Order Shipped

Dear {CUSTOMER_NAME},

Good news! Your order #{ORDER_ID} has been shipped and is on its way to you.

TRACKING INFORMATION
Courier Service: {CARRIER}
Tracking Number: {TRACKING_NUMBER}
Estimated Delivery: {ESTIMATED_DELIVERY}

Track your package: {TRACKING_URL}

SHIPPED ITEMS
{ITEMS_TEXT}

DELIVERY ADDRESS
{CUSTOMER_NAME}
{SHIPPING_ADDRESS}
{CITY}, {STATE}

NEED ASSISTANCE?
WhatsApp: {WHATSAPP_NUMBER}
Email: {STORE_EMAIL}

Thank you for choosing GlowNatura
© 2025 GlowNatura. All rights reserved.`,
    variables: [
      { name: 'CUSTOMER_NAME', description: 'Customer full name', example: 'John Doe' },
      { name: 'ORDER_ID', description: 'Order ID', example: 'GN-2025-001' },
      { name: 'CARRIER', description: 'Courier company name', example: 'DHL Express' },
      { name: 'TRACKING_NUMBER', description: 'Tracking number', example: 'DHL123456789' },
      { name: 'TRACKING_URL', description: 'Tracking URL', example: 'https://dhl.com/track/DHL123456789' },
      { name: 'ESTIMATED_DELIVERY', description: 'Estimated delivery date', example: 'January 20, 2025' },
      { name: 'ITEMS_TABLE', description: 'HTML table of items', example: '<table>...</table>' },
      { name: 'ITEMS_TEXT', description: 'Plain text items list', example: '• Product 1 x 2 - ₦10,000' },
      { name: 'SHIPPING_ADDRESS', description: 'Full address', example: '123 Main St, Apt 4B' },
      { name: 'CITY', description: 'City', example: 'Lagos' },
      { name: 'STATE', description: 'State', example: 'Lagos State' },
      { name: 'WHATSAPP_NUMBER', description: 'WhatsApp number', example: '+2348012345678' },
      { name: 'STORE_EMAIL', description: 'Store email', example: 'orders@glownatura.com' }
    ]
  },
  
  order_shipped_local: {
    name: 'Order Shipped - Local Delivery',
    subject: 'Your Order Is Out for Delivery #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">GLOWNATURA</h1>
              <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Premium Skincare</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              
              <h2 style="color: #1f2937; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">Order Out for Delivery</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear {CUSTOMER_NAME},
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Your order <strong>#{ORDER_ID}</strong> has been dispatched via local delivery service.
              </p>
              
              <!-- Delivery Details -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 24px; margin: 24px 0; border-radius: 4px;">
                <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Delivery Information</h3>
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr>
                    <td style="color: #15803d; font-size: 14px; font-weight: 600; width: 40%;">Delivery Contact:</td>
                    <td style="color: #15803d; font-size: 14px; font-weight: 700;">{DELIVERY_CONTACT}</td>
                  </tr>
                  <tr>
                    <td style="color: #15803d; font-size: 14px; font-weight: 600;">Estimated Delivery:</td>
                    <td style="color: #15803d; font-size: 14px;">{ESTIMATED_DELIVERY}</td>
                  </tr>
                </table>
                
                <!-- Custom Message -->
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #bbf7d0;">
                  <p style="color: #166534; font-size: 14px; line-height: 1.6; margin: 0;">
                    {CUSTOM_MESSAGE}
                  </p>
                </div>
              </div>
              
              <!-- Items -->
              <h3 style="color: #1f2937; margin: 24px 0 16px 0; font-size: 18px; font-weight: 600;">Order Items</h3>
              {ITEMS_TABLE}
              
              <!-- Delivery Address -->
              <h3 style="color: #1f2937; margin: 24px 0 16px 0; font-size: 18px; font-weight: 600;">Delivery Address</h3>
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; border: 1px solid #e5e7eb;">
                <p style="color: #1f2937; font-size: 14px; line-height: 1.8; margin: 0;">
                  {CUSTOMER_NAME}<br>
                  {SHIPPING_ADDRESS}<br>
                  {CITY}, {STATE}
                </p>
              </div>
              
              <!-- Contact -->
              <div style="margin-top: 32px; padding: 24px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Need Assistance?</h3>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                  WhatsApp: <a href="https://wa.me/{WHATSAPP_NUMBER}" style="color: #059669; text-decoration: none; font-weight: 600;">{WHATSAPP_NUMBER}</a><br>
                  Email: <a href="mailto:{STORE_EMAIL}" style="color: #059669; text-decoration: none; font-weight: 600;">{STORE_EMAIL}</a>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                Thank you for choosing GlowNatura
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                &copy; 2025 GlowNatura. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Order Out for Delivery

Dear {CUSTOMER_NAME},

Your order #{ORDER_ID} has been dispatched via local delivery service.

DELIVERY INFORMATION
Delivery Contact: {DELIVERY_CONTACT}
Estimated Delivery: {ESTIMATED_DELIVERY}

{CUSTOM_MESSAGE}

ORDER ITEMS
{ITEMS_TEXT}

DELIVERY ADDRESS
{CUSTOMER_NAME}
{SHIPPING_ADDRESS}
{CITY}, {STATE}

NEED ASSISTANCE?
WhatsApp: {WHATSAPP_NUMBER}
Email: {STORE_EMAIL}

Thank you for choosing GlowNatura
© 2025 GlowNatura. All rights reserved.`,
    variables: [
      { name: 'CUSTOMER_NAME', description: 'Customer full name', example: 'John Doe' },
      { name: 'ORDER_ID', description: 'Order ID', example: 'GN-2025-001' },
      { name: 'DELIVERY_CONTACT', description: 'Rider phone number', example: '0908890890' },
      { name: 'ESTIMATED_DELIVERY', description: 'Estimated delivery date', example: 'January 20, 2025' },
      { name: 'CUSTOM_MESSAGE', description: 'Custom delivery instructions from admin', example: 'Our rider will call you 30 minutes before arrival.' },
      { name: 'ITEMS_TABLE', description: 'HTML table of items', example: '<table>...</table>' },
      { name: 'ITEMS_TEXT', description: 'Plain text items list', example: '• Product 1 x 2 - ₦10,000' },
      { name: 'SHIPPING_ADDRESS', description: 'Full address', example: '123 Main St, Apt 4B' },
      { name: 'CITY', description: 'City', example: 'Lagos' },
      { name: 'STATE', description: 'State', example: 'Lagos State' },
      { name: 'WHATSAPP_NUMBER', description: 'WhatsApp number', example: '+2348012345678' },
      { name: 'STORE_EMAIL', description: 'Store email', example: 'orders@glownatura.com' }
    ]
  },
  
  order_shipped_pickup: {
    name: 'Order Ready - Pickup Available',
    subject: 'Your Order Is Ready for Pickup #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">GLOWNATURA</h1>
              <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Premium Skincare</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              
              <h2 style="color: #1f2937; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">Order Ready for Pickup</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear {CUSTOMER_NAME},
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Great news! Your order <strong>#{ORDER_ID}</strong> is ready and waiting for you.
              </p>
              
              <!-- Pickup Details -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 24px; margin: 24px 0; border-radius: 4px;">
                <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Pickup Information</h3>
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr>
                    <td style="color: #15803d; font-size: 14px; font-weight: 600; width: 40%;">Pickup Location:</td>
                    <td style="color: #15803d; font-size: 14px;">{PICKUP_ADDRESS}</td>
                  </tr>
                  <tr>
                    <td style="color: #15803d; font-size: 14px; font-weight: 600;">Contact Number:</td>
                    <td style="color: #15803d; font-size: 14px; font-weight: 700;">{PICKUP_CONTACT}</td>
                  </tr>
                  <tr>
                    <td style="color: #15803d; font-size: 14px; font-weight: 600;">Available Until:</td>
                    <td style="color: #15803d; font-size: 14px;">{PICKUP_DEADLINE}</td>
                  </tr>
                </table>
                
                <!-- Important Notice -->
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #bbf7d0;">
                  <p style="color: #166534; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                    Please bring your order confirmation and a valid ID when collecting your order.
                  </p>
                </div>
              </div>
              
              <!-- Items -->
              <h3 style="color: #1f2937; margin: 24px 0 16px 0; font-size: 18px; font-weight: 600;">Items to Collect</h3>
              {ITEMS_TABLE}
              
              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Order Number:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">{ORDER_ID}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Total Amount:</td>
                        <td style="color: #059669; font-size: 16px; font-weight: 700; text-align: right;">{TOTAL}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Contact -->
              <div style="margin-top: 32px; padding: 24px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Questions About Pickup?</h3>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                  WhatsApp: <a href="https://wa.me/{WHATSAPP_NUMBER}" style="color: #059669; text-decoration: none; font-weight: 600;">{WHATSAPP_NUMBER}</a><br>
                  Email: <a href="mailto:{STORE_EMAIL}" style="color: #059669; text-decoration: none; font-weight: 600;">{STORE_EMAIL}</a>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                Thank you for choosing GlowNatura
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                &copy; 2025 GlowNatura. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Order Ready for Pickup

Dear {CUSTOMER_NAME},

Great news! Your order #{ORDER_ID} is ready and waiting for you.

PICKUP INFORMATION
Pickup Location: {PICKUP_ADDRESS}
Contact Number: {PICKUP_CONTACT}
Available Until: {PICKUP_DEADLINE}

Please bring your order confirmation and a valid ID when collecting your order.

ITEMS TO COLLECT
{ITEMS_TEXT}

ORDER SUMMARY
Order Number: {ORDER_ID}
Total Amount: {TOTAL}

QUESTIONS ABOUT PICKUP?
WhatsApp: {WHATSAPP_NUMBER}
Email: {STORE_EMAIL}

Thank you for choosing GlowNatura
© 2025 GlowNatura. All rights reserved.`,
    variables: [
      { name: 'CUSTOMER_NAME', description: 'Customer full name', example: 'John Doe' },
      { name: 'ORDER_ID', description: 'Order ID', example: 'GN-2025-001' },
      { name: 'PICKUP_ADDRESS', description: 'Pickup location address', example: '45 Allen Avenue, Ikeja, Lagos' },
      { name: 'PICKUP_CONTACT', description: 'Store contact number', example: '+2348012345678' },
      { name: 'PICKUP_DEADLINE', description: 'Last date to pickup', example: 'January 25, 2025' },
      { name: 'ITEMS_TABLE', description: 'HTML table of items', example: '<table>...</table>' },
      { name: 'ITEMS_TEXT', description: 'Plain text items list', example: '• Product 1 x 2 - ₦10,000' },
      { name: 'TOTAL', description: 'Order total', example: '₦25,000' },
      { name: 'WHATSAPP_NUMBER', description: 'WhatsApp number', example: '+2348012345678' },
      { name: 'STORE_EMAIL', description: 'Store email', example: 'orders@glownatura.com' }
    ]
  },
  
  order_delivered: {
    name: 'Order Delivered - Thank You',
    subject: 'Your Order Has Been Delivered #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">GLOWNATURA</h1>
              <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Premium Skincare</p>
            </td>
          </tr>
          
          <!-- Success Badge -->
          <tr>
            <td style="padding: 40px 40px 24px 40px; text-align: center;">
              <div style="background-color: #d1fae5; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px auto; display: inline-block; line-height: 80px; font-size: 40px; color: #059669; font-weight: 700;">✓</div>
              <h2 style="color: #059669; margin: 0 0 12px 0; font-size: 26px; font-weight: 600;">Order Delivered Successfully</h2>
              <p style="color: #4b5563; font-size: 16px; margin: 0;">We hope you love your products</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear <strong>{CUSTOMER_NAME}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Your order <strong>#{ORDER_ID}</strong> has been successfully delivered. We hope you enjoy your GlowNatura products!
              </p>
              
              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Summary</h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Order Number:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">{ORDER_ID}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Delivered On:</td>
                        <td style="color: #1f2937; font-size: 14px; text-align: right; padding: 8px 0;">{DELIVERY_DATE}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Items Delivered -->
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Delivered Items</h3>
              {ITEMS_TABLE}
              
              <!-- Skincare Tips -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; margin: 32px 0; border-radius: 4px;">
                <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Skincare Tips</h3>
                <p style="color: #1e3a8a; font-size: 14px; line-height: 1.8; margin: 0;">
                  <strong>1.</strong> Perform a patch test before full application<br>
                  <strong>2.</strong> Store products in a cool, dry place away from direct sunlight<br>
                  <strong>3.</strong> Use products consistently for best results<br>
                  <strong>4.</strong> Follow the recommended usage instructions on each product
                </p>
              </div>
              
              <!-- Share Experience -->
              <div style="background-color: #f0fdf4; padding: 24px; border-radius: 8px; border: 1px solid #bbf7d0; text-align: center; margin: 24px 0;">
                <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Share Your Experience</h3>
                <p style="color: #15803d; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                  We would love to hear your feedback! Share your experience and help other customers make informed decisions.
                </p>
                <p style="color: #166534; font-size: 13px; margin: 0;">
                  Tag us on social media: <strong>@glownatura</strong>
                </p>
              </div>
              
              <!-- Contact -->
              <div style="margin-top: 32px; padding: 24px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Need Support?</h3>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                  If you have any questions or concerns about your products:<br>
                  WhatsApp: <a href="https://wa.me/{WHATSAPP_NUMBER}" style="color: #059669; text-decoration: none; font-weight: 600;">{WHATSAPP_NUMBER}</a><br>
                  Email: <a href="mailto:{STORE_EMAIL}" style="color: #059669; text-decoration: none; font-weight: 600;">{STORE_EMAIL}</a>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                Thank you for choosing GlowNatura
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                &copy; 2025 GlowNatura. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Order Delivered Successfully

Dear {CUSTOMER_NAME},

Your order #{ORDER_ID} has been successfully delivered. We hope you enjoy your GlowNatura products!

ORDER SUMMARY
Order Number: {ORDER_ID}
Delivered On: {DELIVERY_DATE}

DELIVERED ITEMS
{ITEMS_TEXT}

SKINCARE TIPS
1. Perform a patch test before full application
2. Store products in a cool, dry place away from direct sunlight
3. Use products consistently for best results
4. Follow the recommended usage instructions on each product

SHARE YOUR EXPERIENCE
We would love to hear your feedback! Share your experience and help other customers make informed decisions.

Tag us on social media: @glownatura

NEED SUPPORT?
If you have any questions or concerns about your products:
WhatsApp: {WHATSAPP_NUMBER}
Email: {STORE_EMAIL}

Thank you for choosing GlowNatura
© 2025 GlowNatura. All rights reserved.`,
    variables: [
      { name: 'CUSTOMER_NAME', description: 'Customer full name', example: 'John Doe' },
      { name: 'ORDER_ID', description: 'Order ID', example: 'GN-2025-001' },
      { name: 'DELIVERY_DATE', description: 'Delivery date', example: 'January 20, 2025' },
      { name: 'ITEMS_TABLE', description: 'HTML table of items', example: '<table>...</table>' },
      { name: 'ITEMS_TEXT', description: 'Plain text items list', example: '• Product 1 x 2 - ₦10,000' },
      { name: 'WHATSAPP_NUMBER', description: 'WhatsApp number', example: '+2348012345678' },
      { name: 'STORE_EMAIL', description: 'Store email', example: 'orders@glownatura.com' }
    ]
  },
  
  order_cancelled: {
    name: 'Order Cancelled',
    subject: 'Order Cancellation Confirmation #{ORDER_ID}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">GLOWNATURA</h1>
              <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Premium Skincare</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              
              <h2 style="color: #1f2937; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">Order Cancelled</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Dear {CUSTOMER_NAME},
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Your order <strong>#{ORDER_ID}</strong> has been cancelled.
              </p>
              
              <!-- Cancellation Details -->
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 24px; margin: 24px 0; border-radius: 4px;">
                <h3 style="color: #991b1b; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Cancellation Reason</h3>
                <p style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0;">
                  {CANCEL_REASON}
                </p>
              </div>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Order Number:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">{ORDER_ID}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Cancelled On:</td>
                        <td style="color: #1f2937; font-size: 14px; text-align: right; padding: 8px 0;">{CANCEL_DATE}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Order Amount:</td>
                        <td style="color: #1f2937; font-size: 16px; font-weight: 600; text-align: right; padding: 8px 0;">{TOTAL}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Items -->
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Cancelled Items</h3>
              {ITEMS_TABLE}
              
              <!-- Refund Information (if paid) -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; margin: 32px 0; border-radius: 4px;">
                <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Refund Information</h3>
                <p style="color: #1e3a8a; font-size: 14px; line-height: 1.6; margin: 0;">
                  {REFUND_MESSAGE}
                </p>
              </div>
              
              <!-- Shop Again -->
              <div style="background-color: #f0fdf4; padding: 24px; border-radius: 8px; border: 1px solid #bbf7d0; text-align: center; margin: 24px 0;">
                <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">We Hope to Serve You Again</h3>
                <p style="color: #15803d; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                  Discover our range of premium skincare products designed to give you healthy, glowing skin.
                </p>
                <a href="{STORE_URL}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Browse Products</a>
              </div>
              
              <!-- Contact -->
              <div style="margin-top: 32px; padding: 24px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Questions About This Cancellation?</h3>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                  WhatsApp: <a href="https://wa.me/{WHATSAPP_NUMBER}" style="color: #059669; text-decoration: none; font-weight: 600;">{WHATSAPP_NUMBER}</a><br>
                  Email: <a href="mailto:{STORE_EMAIL}" style="color: #059669; text-decoration: none; font-weight: 600;">{STORE_EMAIL}</a>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                Thank you for choosing GlowNatura
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                &copy; 2025 GlowNatura. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Order Cancelled

Dear {CUSTOMER_NAME},

Your order #{ORDER_ID} has been cancelled.

CANCELLATION REASON
{CANCEL_REASON}

ORDER DETAILS
Order Number: {ORDER_ID}
Cancelled On: {CANCEL_DATE}
Order Amount: {TOTAL}

CANCELLED ITEMS
{ITEMS_TEXT}

REFUND INFORMATION
{REFUND_MESSAGE}

WE HOPE TO SERVE YOU AGAIN
Discover our range of premium skincare products designed to give you healthy, glowing skin.

Visit us: {STORE_URL}

QUESTIONS ABOUT THIS CANCELLATION?
WhatsApp: {WHATSAPP_NUMBER}
Email: {STORE_EMAIL}

Thank you for choosing GlowNatura
© 2025 GlowNatura. All rights reserved.`,
    variables: [
      { name: 'CUSTOMER_NAME', description: 'Customer full name', example: 'John Doe' },
      { name: 'ORDER_ID', description: 'Order ID', example: 'GN-2025-001' },
      { name: 'CANCEL_DATE', description: 'Cancellation date', example: 'January 15, 2025' },
      { name: 'TOTAL', description: 'Order total', example: '₦25,000' },
      { name: 'CANCEL_REASON', description: 'Reason for cancellation', example: 'Payment not received within 6 hours' },
      { name: 'REFUND_MESSAGE', description: 'Refund status message', example: 'If payment was made, your refund will be processed within 5-7 business days.' },
      { name: 'ITEMS_TABLE', description: 'HTML table of items', example: '<table>...</table>' },
      { name: 'ITEMS_TEXT', description: 'Plain text items list', example: '• Product 1 x 2 - ₦10,000' },
      { name: 'STORE_URL', description: 'Store website URL', example: 'https://glownatura.com' },
      { name: 'WHATSAPP_NUMBER', description: 'WhatsApp number', example: '+2348012345678' },
      { name: 'STORE_EMAIL', description: 'Store email', example: 'orders@glownatura.com' }
    ]
  }
};

