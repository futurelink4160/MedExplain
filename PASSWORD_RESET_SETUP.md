# Password Reset Setup Guide

## Issue
Password reset links in emails are redirecting to the homepage instead of the reset password page.

## Solution
You need to whitelist the redirect URL in your Supabase project settings.

### Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard

2. **Select your project**

3. **Go to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "URL Configuration"

4. **Add Redirect URL**
   - Under "Redirect URLs", add your application URL followed by `/reset-password`
   - For local development: `http://localhost:5173/reset-password`
   - For production: `https://yourdomain.com/reset-password`

   Example:
   ```
   http://localhost:5173/reset-password
   https://yourdomain.com/reset-password
   ```

5. **Save the changes**

6. **Test the flow**
   - Request a password reset email
   - Click the link in the email
   - You should now be redirected to the reset password page

## Additional Notes

- You may need to add multiple redirect URLs if you have different environments (development, staging, production)
- The redirect URL must match exactly (including the protocol: http vs https)
- Changes take effect immediately after saving

## Troubleshooting

If the issue persists after adding the redirect URL:

1. **Clear browser cache and cookies**
2. **Try in an incognito/private window**
3. **Verify the redirect URL in Supabase matches your application URL exactly**
4. **Check browser console for any errors**
