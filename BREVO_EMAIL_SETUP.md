# Brevo Email Configuration Guide

## What Changed

The backend has been updated to use Brevo's API instead of SMTP for better reliability and performance.

### Benefits of API over SMTP:
- No connection timeouts
- Faster email delivery
- Better error handling
- More reliable on cloud platforms like Render
- Better logging and tracking

## Required Environment Variables

### For Render (Production)

Add these environment variables to your Render service:

1. **BREVO_API_KEY** (Required)
   ```
   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
   ```

2. **FROM_EMAIL** (Required)
   ```
   noreply@glownatura.com
   ```
   (Use your verified sender email from Brevo)

3. **FROM_NAME** (Optional)
   ```
   GlowNatura
   ```

### For Local Development (.env file)

Update your `.env` file with these variables:

```env
# Brevo Email Configuration (API)
BREVO_API_KEY=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
FROM_EMAIL=noreply@glownatura.com
FROM_NAME=GlowNatura
```

### Old SMTP Variables (No Longer Needed)

You can remove these from Render and `.env`:
- BREVO_SMTP_HOST
- BREVO_SMTP_PORT
- BREVO_SMTP_USER
- BREVO_SMTP_PASSWORD

## Setup Instructions

### Step 1: Update Render Environment Variables

1. Go to Render Dashboard: https://dashboard.render.com
2. Select your backend service: `glownatura-backend`
3. Click on "Environment" tab
4. Add these new variables:
   - `BREVO_API_KEY` = `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`
   - `FROM_EMAIL` = Your verified sender email (e.g., `noreply@glownatura.com`)
   - `FROM_NAME` = `GlowNatura`
5. Remove old SMTP variables (optional cleanup)
6. Click "Save Changes"
7. Render will automatically redeploy

### Step 2: Verify Sender Email in Brevo

1. Login to Brevo: https://app.brevo.com
2. Go to **Senders, Domains & Dedicated IPs** > **Senders**
3. Make sure your sender email is verified
4. If not verified, add it and verify it

### Step 3: Test Email Sending

After Render redeploys, test the verification email again:

```powershell
$body = @{email = "chsiomjoy2029@glownaturas.com"} | ConvertTo-Json
curl -X POST https://backendglownaturas.onrender.com/api/auth/resend-verification -H "Content-Type: application/json" -d $body
```

## Troubleshooting

### Error: "Invalid API Key"
- Check that BREVO_API_KEY is set correctly in Render
- Make sure there are no extra spaces in the key
- Verify the key is active in Brevo dashboard

### Error: "Sender not verified"
- Go to Brevo > Senders and verify your sender email
- Update FROM_EMAIL in Render to match the verified email

### Error: "Daily sending limit exceeded"
- Brevo free plan has sending limits
- Check your usage in Brevo dashboard
- Upgrade plan if needed

## Brevo Dashboard Links

- Dashboard: https://app.brevo.com
- API Keys: https://app.brevo.com/settings/keys/api
- Senders: https://app.brevo.com/settings/keys/senders
- Logs: https://app.brevo.com/logs

## Testing Checklist

After setup, test these email functions:
- [ ] Email verification (registration)
- [ ] Password reset
- [ ] Order confirmation
- [ ] Order status updates

## SMTP Alternative (Backup Option)

If you prefer to use SMTP instead of API, here's the configuration:

### SMTP Environment Variables:
```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@glownatura.com
BREVO_SMTP_PASSWORD=xsmtpsib-3ee561d45adae327434b2b3f5db14605a99f230c1dd853fddb4554e4c9c4c5b1-ApUj63hipa3IVF8c
```

Note: SMTP is not recommended due to connection timeout issues on Render.

## Support

If you continue to face issues:
1. Check Render logs for detailed error messages
2. Check Brevo logs for delivery status
3. Verify all environment variables are set correctly
4. Make sure sender email is verified in Brevo

