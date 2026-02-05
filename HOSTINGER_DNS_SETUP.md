# 🌐 Hostinger DNS Setup Guide for genschoolmail.in

## **Step-by-Step Guide - Complete Setup**

Your Domain: **genschoolmail.in**
Platform: **Hostinger**
Deployment: **Vercel**

---

## 📋 **Part 1: Hostinger DNS Configuration**

### **Step 1: Login to Hostinger**
1. Go to https://hostinger.in
2. Login with your credentials
3. Click **Domains** in sidebar

### **Step 2: Select Your Domain**
1. Find **genschoolmail.in** in domain list
2. Click **Manage** button next to it

### **Step 3: DNS/Name Servers Configuration**

#### **Option A: Use Hostinger DNS (Recommended)**

**3a. Go to DNS Zone Editor:**
1. Click on **DNS / Name Servers** tab
2. Select **DNS Zone Editor**
3. You'll see existing DNS records

**3b. Add Vercel DNS Records:**

**Delete existing A records if any, then add:**

```
Type: A
Name: @ (or leave blank)
Points to: 76.76.21.21
TTL: 14400 (or Auto)
```

**Add CNAME for www:**
```
Type: CNAME
Name: www
Points to: cname.vercel-dns.com
TTL: 14400
```

**Add Wildcard CNAME for subdomains (Multi-tenant support):**
```
Type: CNAME
Name: *
Points to: cname.vercel-dns.com
TTL: 14400
```

**3c. Save Changes:**
- Click **Add Record** after each entry
- Wait for changes to save

#### **Option B: Use Vercel DNS (Alternative)**

If Option A doesn't work, use Vercel nameservers:

**3a. Get Nameservers from Vercel:**
1. Go to Vercel Dashboard → Your Project
2. Settings → Domains → Add Domain
3. Vercel will show nameservers (something like):
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

**3b. Update Nameservers in Hostinger:**
1. In Hostinger → Domains → genschoolmail.in
2. Click **Change Nameservers**
3. Select **Custom Nameservers**
4. Enter Vercel nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
5. Click **Change Nameservers**

---

## 📋 **Part 2: Vercel Configuration**

### **Step 1: Add Domain in Vercel**
1. Go to https://vercel.com/dashboard
2. Select your **School Management** project
3. Click **Settings** → **Domains**
4. Click **Add** button
5. Enter: `genschoolmail.in`
6. Click **Add**

**Also add www subdomain:**
7. Click **Add** again
8. Enter: `www.genschoolmail.in`
9. Click **Add**

### **Step 2: Verify Domain**
- Vercel will check DNS configuration
- Status will show **Valid Configuration** (may take 5-30 mins)

### **Step 3: Set Environment Variables**
1. Go to **Settings** → **Environment Variables**
2. Add/Update these variables:

```bash
BASE_DOMAIN=genschoolmail.in
NEXTAUTH_URL=https://genschoolmail.in
```

3. Click **Save** for each
4. Variables should apply to **Production, Preview, Development**

### **Step 4: Redeploy Application**
1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **...** (three dots) → **Redeploy**
4. Confirm redeploy

---

## ⏰ **Part 3: Wait for DNS Propagation**

**DNS changes take time to propagate:**
- **Minimum:** 5-30 minutes
- **Maximum:** 24-48 hours (rare)
- **Usually:** 15-30 minutes

**Check DNS Propagation:**
- Visit: https://dnschecker.org
- Enter: `genschoolmail.in`
- Check A record shows: `76.76.21.21`
- Check CNAME for `www` shows: `cname.vercel-dns.com`

---

## ✅ **Part 4: Testing**

After DNS propagates, test these URLs:

### **Main Domain:**
```
https://genschoolmail.in
```
Should show your main site/login page

### **Super Admin:**
```
https://genschoolmail.in/super-admin
```
Login credentials:
- Email: `superadmin@school.com`
- Password: `password123`

### **Test Subdomains (Multi-tenant):**
```
https://school1.genschoolmail.in
https://demo.genschoolmail.in
https://test.genschoolmail.in
```
Any subdomain should work!

---

## 🔧 **Hostinger-Specific Tips**

### **Where to Find DNS Settings:**
**Method 1:** Domains → Manage → DNS/Name Servers → DNS Zone
**Method 2:** hPanel → Domains → Manage Domain → Advanced → DNS Zone Editor

### **Common Hostinger DNS Formats:**

**A Record:**
- Name: `@` (for root domain)
- Type: `A`
- Points to: `76.76.21.21`

**CNAME Record:**
- Name: `www` or `*`
- Type: `CNAME`
- Points to: `cname.vercel-dns.com`

**TTL:**
- Usually `14400` (4 hours) or `Auto`
- Lower TTL = faster DNS updates

### **SSL Certificate:**
- Vercel auto-provisions FREE SSL/HTTPS
- Takes 5-10 minutes after domain verification
- No action needed from your side!

---

## 🚨 **Troubleshooting**

### **Issue 1: Domain Not Verifying in Vercel**
**Symptoms:** Shows "Invalid Configuration"

**Fix:**
1. Wait 30 minutes for DNS propagation
2. Check DNS records in Hostinger are correct
3. Use https://dnschecker.org to verify DNS
4. Try removing and re-adding domain in Vercel

### **Issue 2: Subdomain Not Working**
**Symptoms:** `school1.genschoolmail.in` gives error

**Fix:**
1. Ensure wildcard CNAME `*` is added in Hostinger DNS
2. Format: `* → cname.vercel-dns.com`
3. Wait for DNS propagation

### **Issue 3: SSL/HTTPS Error**
**Symptoms:** "Your connection is not private"

**Fix:**
1. Wait 10-15 minutes after domain verification
2. Vercel is provisioning SSL certificate
3. Clear browser cache
4. Try incognito mode

### **Issue 4: Redirecting to Old Vercel URL**
**Symptoms:** Domain redirects to `yourapp.vercel.app`

**Fix:**
1. Check `BASE_DOMAIN` env var is set correctly
2. Ensure it's set to `genschoolmail.in` (NOT `yourapp.vercel.app`)
3. Redeploy after changing env vars

### **Issue 5: Hostinger Shows DNS Error**
**Symptoms:** "DNS zone contains errors"

**Fix:**
1. Remove duplicate A records
2. Keep only one A record: `@ → 76.76.21.21`
3. Ensure CNAME records don't conflict with A records
4. Root (`@`) should be A record, NOT CNAME

---

## 📝 **Quick Checklist**

### **Hostinger Side:**
- [ ] Logged into Hostinger
- [ ] Found genschoolmail.in domain
- [ ] Added A record: `@ → 76.76.21.21`
- [ ] Added CNAME: `www → cname.vercel-dns.com`
- [ ] Added CNAME: `* → cname.vercel-dns.com`
- [ ] Saved all DNS changes

### **Vercel Side:**
- [ ] Added domain in Vercel
- [ ] Domain shows "Valid Configuration"
- [ ] Set `BASE_DOMAIN=genschoolmail.in`
- [ ] Set `NEXTAUTH_URL=https://genschoolmail.in`
- [ ] Redeployed application
- [ ] SSL certificate provisioned

### **Testing:**
- [ ] https://genschoolmail.in accessible
- [ ] https://www.genschoolmail.in redirects correctly
- [ ] https://genschoolmail.in/super-admin works
- [ ] Subdomains working (e.g., school1.genschoolmail.in)
- [ ] HTTPS/SSL working (green padlock)

---

## 🎉 **Success!**

Your School Management System is now live at:
- **Main Site:** https://genschoolmail.in
- **Super Admin:** https://genschoolmail.in/super-admin
- **School Portals:** https://[school-name].genschoolmail.in

---

## 📞 **Need Help?**

**Hostinger Support:**
- Live Chat: Available in hPanel
- Email: support@hostinger.in
- Knowledge Base: https://support.hostinger.com

**Vercel Support:**
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

**Check DNS:** https://dnschecker.org
**Check SSL:** https://www.sslshopper.com/ssl-checker.html
