# Custom Domain Setup Guide for Vercel School Management System

## 🌐 How to Add Custom Domain on Vercel

### **Step 1: Buy Your Domain**
Purchase a domain from any domain registrar:
- **GoDaddy** (https://godaddy.com)
- **Namecheap** (https://namecheap.com)
- **Google Domains** (https://domains.google)
- **Cloudflare** (https://cloudflare.com)

---

### **Step 2: Add Domain to Vercel**

1. **Open Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project (School Management System)

2. **Navigate to Settings**
   - Click **Settings** tab
   - Click **Domains** from sidebar

3. **Add Your Domain**
   - Click **Add** button
   - Enter your domain name (e.g., `yourdomain.com`)
   - Click **Add**

4. **Vercel Will Show DNS Records**
   - Type: `A Record`
   - Name: `@`
   - Value: `76.76.21.21` (Vercel's IP)
   
   OR
   
   - Type: `CNAME`
   - Name: `@` (or leave blank)
   - Value: `cname.vercel-dns.com`

---

### **Step 3: Configure DNS at Your Domain Registrar**

#### **For GoDaddy:**
1. Login to GoDaddy account
2. Go to **My Products** → **Domains**
3. Click **DNS** next to your domain
4. Add these records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 600
   ```
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 600
   ```

#### **For Namecheap:**
1. Login to Namecheap
2. Go to **Domain List** → Select domain → **Manage**
3. **Advanced DNS** tab
4. Add records:
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   ```
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

#### **For Cloudflare:**
1. Login to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Add:
   ```
   Type: A
   Name: @
   IPv4: 76.76.21.21
   Proxy: OFF (DNS Only)
   ```
   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy: OFF
   ```

---

### **Step 4: Add Subdomain Support (Multi-Tenant)**

For multi-tenant (e.g., `school1.yourdomain.com`, `school2.yourdomain.com`):

**Add Wildcard DNS:**
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: 600
```

This allows ANY subdomain to work (e.g., `*.yourdomain.com`)

---

### **Step 5: Configure Environment Variables on Vercel**

1. Go to **Settings** → **Environment Variables**
2. Add new variable:
   ```
   Name: BASE_DOMAIN
   Value: yourdomain.com
   ```
3. Click **Save**
4. **Redeploy** your application

---

### **Step 6: Verify Domain**

1. Wait **5-30 minutes** for DNS propagation
2. Check status in Vercel Domains section
3. Should show: ✅ **Valid Configuration**

Test your domain:
- `https://yourdomain.com` → Main site
- `https://yourdomain.com/super-admin` → Super admin login
- `https://school1.yourdomain.com` → School 1 portal
- `https://school2.yourdomain.com` → School 2 portal

---

## 🔧 Environment Variables Required

Add these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

```bash
# Your custom domain (no https://)
BASE_DOMAIN=yourdomain.com

# Database URL (Already set)
DATABASE_URL=your_neon_postgresql_url

# NextAuth Secret (Already set)
AUTH_SECRET=your_secret_key

# NextAuth URL (Update to your custom domain)
NEXTAUTH_URL=https://yourdomain.com
```

**After adding/updating environment variables, you MUST redeploy!**

---

## ✅ Verification Checklist

- [ ] Domain purchased
- [ ] DNS records added at registrar
- [ ] Domain added in Vercel
- [ ] Wildcard CNAME added for subdomains
- [ ] `BASE_DOMAIN` environment variable set
- [ ] `NEXTAUTH_URL` updated
- [ ] Application redeployed
- [ ] DNS propagated (wait 5-30 mins)
- [ ] Main domain accessible
- [ ] Super admin accessible
- [ ] School subdomains accessible

---

## 🚨 Common Issues

**Issue 1: "Invalid Configuration" in Vercel**
- **Fix:** Wait for DNS propagation (can take up to 48 hours, usually 5-30 mins)
- Check DNS records are correct at your registrar

**Issue 2: Subdomain not working**
- **Fix:** Ensure wildcard CNAME (`*`) is added
- Format: `*.yourdomain.com → cname.vercel-dns.com`

**Issue 3: Redirect loop**
- **Fix:** Make sure `BASE_DOMAIN` env var matches your actual domain
- Redeploy after setting env vars

**Issue 4: SSL/HTTPS not working**
- **Fix:** Vercel automatically provisions SSL certificates
- Wait a few minutes after domain verification
- Ensure DNS is pointing to Vercel correctly

---

## 📝 Quick Setup Summary

```bash
# 1. Buy domain: yourdomain.com

# 2. Add DNS records:
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com
CNAME *    cname.vercel-dns.com  # For subdomains

# 3. In Vercel Dashboard:
Settings → Domains → Add "yourdomain.com"
Settings → Environment Variables → Add "BASE_DOMAIN=yourdomain.com"
Settings → Environment Variables → Update "NEXTAUTH_URL=https://yourdomain.com"

# 4. Redeploy application

# 5. Wait 5-30 minutes for DNS propagation

# 6. Test: https://yourdomain.com
```

---

## 🎉 Done!

Your School Management System is now live on your custom domain!

**Support Links:**
- Vercel Domains Docs: https://vercel.com/docs/concepts/projects/domains
- DNS Checker: https://dnschecker.org
