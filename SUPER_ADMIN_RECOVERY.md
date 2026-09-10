# Super Admin Emergency Password Recovery

## ⚠️ CONFIDENTIAL - FOR AUTHORIZED PERSONNEL ONLY

This document contains sensitive information for emergency super admin password recovery.

---

## Secret Recovery URL

```
http://127.0.0.1:8000/emergency-super-admin-recovery-985f21bc25e6fa14c87717bcbb1d6783
```

**Production URL Pattern:**
```
https://your-domain.com/emergency-super-admin-recovery-985f21bc25e6fa14c87717bcbb1d6783
```

> The URL contains a hashed segment (`md5('snhs-recovery-2024')`) for security. Do not share this URL publicly.

---

## Recovery Code

```
ac4754231ad632f2ec27a02a8e6a752a0da1db5f
```

**Security Notes:**
- This code is hardcoded in the system
- It must be kept confidential
- Only use in emergency situations
- All recovery attempts are logged

---

## How to Use

### Step 1: Access the Recovery Page
1. Navigate to the secret URL above
2. You will see a red warning banner: "RESTRICTED ACCESS"

### Step 2: Verify Identity
Enter the following:
- **Username**: Your super admin username (email)
- **Recovery Code**: `SNHS-RECOVERY-2024-SUPER-ADMIN`

### Step 3: Reset Password
1. After verification, you'll see a green success banner
2. Enter your new password (minimum 8 characters)
3. Confirm the password
4. Click "Reset Password"

### Step 4: Login
- You'll be redirected to the login page
- Use your username and NEW password to login

---

## Security Features

1. **Secret URL**: The recovery endpoint uses a hashed URL to prevent unauthorized access
2. **Hardcoded Recovery Code**: The code is embedded in the system, not in database
3. **Super Admin Only**: Only accounts with role="super_admin" can use this
4. **Session-based**: Verification is stored in session, expires after reset
5. **Logging**: All recovery attempts should be logged (implement as needed)

---

## Troubleshooting

**Error: "Username not found"**
- Verify the username is correct
- Check if the user exists in the database

**Error: "This account is not a super admin"**
- The account must have role="super_admin" in tbl_admins table
- Regular admins cannot use this recovery method

**Error: "Invalid recovery code"**
- Ensure you're using the exact code: `SNHS-RECOVERY-2024-SUPER-ADMIN`
- Code is case-sensitive

**Error: "Session expired"**
- Complete the password reset within the same browser session
- Don't close the browser between steps

---

## Changing the Recovery Code

To change the hardcoded recovery code:

1. Open: `app/Http/Controllers/SuperAdminRecoveryController.php`
2. Find line: `if ($validated['recovery_code'] !== 'SNHS-RECOVERY-2024-SUPER-ADMIN')`
3. Replace with your new code
4. Update this documentation

---

## Database Check

To verify a super admin exists:

```sql
SELECT u.id, u.email, a.role 
FROM users u 
JOIN tbl_admins a ON u.id = a.user_id 
WHERE a.role = 'super_admin';
```

---

## Security Recommendations

1. **Store this document securely** - Do not commit to public repositories
2. **Limit access** - Only system administrators should know this information
3. **Change codes regularly** - Update the recovery code periodically
4. **Monitor usage** - Implement logging to track recovery attempts
5. **Use HTTPS** - Always access recovery page over secure connection in production

---

**Last Updated:** July 7, 2026
**System Version:** SNHS Portal v1.0
