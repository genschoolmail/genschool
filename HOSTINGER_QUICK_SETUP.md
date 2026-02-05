# 🚀 Quick Setup - genschoolmail.in (Hostinger → Vercel)

## **Abhi Turant Karna Hai:**

### 1️⃣ **Hostinger DNS Setup** (5 minutes)

**Login:** https://hostinger.in

**Navigate:**
`Domains → genschoolmail.in → Manage → DNS Zone Editor`

**Add Ye 3 Records:**

```
✅ A Record:
   Name: @
   Value: 76.76.21.21
   TTL: 14400

✅ CNAME (www):
   Name: www
   Value: cname.vercel-dns.com
   TTL: 14400

✅ CNAME (wildcard for subdomains):
   Name: *
   Value: cname.vercel-dns.com
   TTL: 14400
```

**Click "Add Record"** har record ke liye!

---

### 2️⃣ **Vercel Domain Setup** (2 minutes)

**Navigate:**
`Vercel Dashboard → Your Project → Settings → Domains`

**Add Domain:**
1. Click **Add**
2. Enter: `genschoolmail.in`
3. Click **Add**

**Add www:**
1. Click **Add** again
2. Enter: `www.genschoolmail.in`
3. Click **Add**

---

### 3️⃣ **Environment Variables** (2 minutes)

**Navigate:**
`Vercel → Settings → Environment Variables`

**Add/Update:**

```bash
BASE_DOMAIN=genschoolmail.in
NEXTAUTH_URL=https://genschoolmail.in
```

**Save** aur **Redeploy** karo!

---

### 4️⃣ **Wait** (15-30 minutes)

☕ **DNS propagation ka wait karo**

**Check DNS:** https://dnschecker.org
- Enter: `genschoolmail.in`
- Should show: `76.76.21.21`

---

### 5️⃣ **Test Karo**

```
✅ https://genschoolmail.in
✅ https://genschoolmail.in/super-admin
✅ https://school1.genschoolmail.in (any subdomain)
```

**Login:**
- Email: `superadmin@school.com`
- Password: `password123`

---

## ⚡ **Screenshot Guide**

### **Hostinger DNS Settings Should Look Like:**

```
┌─────────────────────────────────────────────────┐
│ DNS Zone Editor - genschoolmail.in              │
├─────────┬──────────┬──────────────────┬─────────┤
│ Type    │ Name     │ Points to        │ TTL     │
├─────────┼──────────┼──────────────────┼─────────┤
│ A       │ @        │ 76.76.21.21      │ 14400   │
│ CNAME   │ www      │ cname.vercel-... │ 14400   │
│ CNAME   │ *        │ cname.vercel-... │ 14400   │
└─────────┴──────────┴──────────────────┴─────────┘
```

---

## 🚨 **Agar Koi Problem Ho:**

**Problem:** Domain verify nahi ho raha Vercel mein
**Solution:** 30 mins wait karo, phir dnschecker.org se check karo

**Problem:** Subdomain nahi chal raha
**Solution:** Wildcard `*` CNAME add kiya hai? Check karo

**Problem:** HTTPS error
**Solution:** 10-15 mins wait - SSL certificate auto-generate ho raha hai

---

## 📞 **Detailed Guide:**
Check: `HOSTINGER_DNS_SETUP.md` (complete instructions)

**Done! 🎉**
