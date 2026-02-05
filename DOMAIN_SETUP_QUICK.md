# Custom Domain Setup - Quick Steps

## 📋 **Vercel Environment Variables to Add**

Vercel Dashboard mein Settings → Environment Variables mein jao aur yeh add karo:

### **Required Variables:**

```bash
# Your actual Vercel domain OR custom domain
BASE_DOMAIN=your-project.vercel.app
# After custom domain setup, change to:
# BASE_DOMAIN=yourdomain.com

# Database (Already set)
DATABASE_URL=postgresql://your_neon_url

# Auth Secret (Already set)
AUTH_SECRET=super_secret_auth_secret_must_be_long_enough

# NextAuth URL - Update this!
NEXTAUTH_URL=https://your-project.vercel.app
# After custom domain:
# NEXTAUTH_URL=https://yourdomain.com
```

**⚠️ IMPORTANT:** Har environment variable add/update karne ke baad **REDEPLOY** karna zaroori hai!

---

## 🌐 **Custom Domain Add Karne Ke Steps**

### **1. Domain Kharido**
- GoDaddy, Namecheap, ya Cloudflare se domain kharido
- Example: `myschool.com`

### **2. Vercel Mein Domain Add Karo**

**Vercel Dashboard:**
1. Project select karo
2. **Settings** → **Domains**
3. **Add** button click karo
4. Domain name enter karo: `myschool.com`
5. **Add** click karo

Vercel tumhe DNS records dikhayega:

```
Type: A
Name: @
Value: 76.76.21.21
```

### **3. Domain Registrar Mein DNS Configure Karo**

**Example - GoDaddy:**
1. GoDaddy account mein login karo
2. **My Products** → **Domains**
3. Apne domain ke saamne **DNS** click karo
4. Yeh records add karo:

```
Type: A
Host: @
Value: 76.76.21.21
TTL: 600
```

```
Type: CNAME  
Host: www
Value: cname.vercel-dns.com
TTL: 600
```

**Multi-tenant ke liye (subdomains support):**
```
Type: CNAME
Host: *
Value: cname.vercel-dns.com
TTL: 600
```

### **4. Vercel Environment Variables Update Karo**

```bash
BASE_DOMAIN=myschool.com
NEXTAUTH_URL=https://myschool.com
```

### **5. Application Redeploy Karo**

Vercel dashboard mein latest deployment par jao aur **Redeploy** click karo.

### **6. Wait Karo**

DNS propagation mein **5-30 minutes** lag sakte hain.

### **7. Test Karo**

```
https://myschool.com → Main site
https://myschool.com/super-admin → Super admin
https://school1.myschool.com → School 1 portal
```

---

## ✅ **Checklist**

- [ ] Domain purchase kiya
- [ ] Vercel mein domain add kiya
- [ ] DNS records add kiye (A, CNAME, Wildcard *)
- [ ] `BASE_DOMAIN` env var set kiya
- [ ] `NEXTAUTH_URL` update kiya
- [ ] Application redeploy kiya
- [ ] DNS propagate hone ka wait kiya (5-30 mins)
- [ ] Testing successful

---

## 🚨 **Current Issue Fix**

**Problem:** Vercel domain se `platform.com/super-admin` redirect ho raha hai

**Solution:** 
1. Vercel Environment Variables mein jao
2. Yeh add karo:
   ```
   BASE_DOMAIN=your-actual-vercel-domain.vercel.app
   ```
3. **Save** aur **Redeploy** karo

**Latest code already pushed hai:**
- Commit: `682a530 Fix: Use BASE_DOMAIN env var for dynamic domain redirect`
- Middleware ab `BASE_DOMAIN` environment variable use karega
- No more hardcoded `platform.com` redirect!

---

## 📞 **Support**

Full detailed guide: Check `CUSTOM_DOMAIN_SETUP.md`

DNS checker: https://dnschecker.org
