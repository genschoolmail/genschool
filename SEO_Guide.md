# Google Search Console (GSC) & SEO Guide for Multi-Tenant School Software

Yeh step-by-step process hai aapke *Main Domain* (Software Selling) aur *Subdomains* (Schools) ke SEO aur Google ranking ke liye. 

Kyunki aapka software ek Multi-Tenant architecture (Subdomains) pe chal raha hai, humein "Domain Property" verify karni zaroori hai. Isse aapko har naye school (subdomain) ko alag se Google me add nahi karna padega, wo automatically main domain ke andar track hone lagenge.

---

## Step 1: Google Search Console Setup (Aapke karne wala kaam)

Aapko apni website Google pe register karni hogi taaki Google aapke main website aur sabhi naye schools ke subdomains ko pehchan sake.

1. **Khulein Google Search Console:** [https://search.google.com/search-console](https://search.google.com/search-console) par jaakar apne Gmail se login karein.
2. **Property add karein:** Left menu ya dashboard se **"Add Property"** par click karein.
3. **Select Property Type:** Screen par 2 options ayenge. **"Domain"** (left bypass) wala option select karein.
4. **Enter Domain Name:** Apni website ka base domain type karein: `genschoolmail.in` (http:// ya www mat lagayein).
5. **DNS Verification (Vercel Users ke liye):** Aapne jo screenshot bheja hai uss par dhyan de:
   - Apne **Vercel Dashboard** ke ussi **"Domains"** page par rahein jaha aap abhi hain.
   - List me aapko `genschoolmail.in` dikhega (2nd number par).
   - Uske samne **"Edit"** button par click karein.
   - Edit menu ke andar **"DNS Records"** ya **"Add DNS Record"** ka option dikhega, wahan jayein.
   - Ek naya DNS record add karein in details ke sath:
     - **Type:** `TXT` chune (Ye bahut zaroori hai).
     - **Name:** Khali chhod de ya `@` likhein.
     - **Value:** Google Search Console ne jo lamba sa "Verification code" diya hai, wo yahan paste karein.
   - "Add" ya "Save" par click karein.
   - *Note:* DNS update hone me 5-30 minutes lag sakte hain.

   - "Add" ya "Save" par click karein.
6. **Verify:** DNS update hone me 5 se 30 minute lag sakte hai. Wapas Search Console par aakar "Verify" button click karein. 

**Result:** Ek bar property verify ho gayi, toh Google aapke `genschoolmail.in` aur automatically sabhi subdomains (`dpschool.genschoolmail.in`, `cityschool.genschoolmail.in`) ka data track karna shuru kar dega.

---

## Step 2: Technical SEO (Main AI/Code Implementation karunga)

Mai aapke Next.js codebase me ye changes implement karunga, jiske baad aapka site SEO ready ho jayega:

1. **Dynamic `sitemap.xml`:**
   - **Main Domain ke liye:** Software selling se related pages (Home, App landing page, Pricing) ka map banega.
   - **Schools (Subdomain) ke liye:** Naya school bante hi automatically school ki details, website, contact, aur announcements ka link sitemap me add ho jayega.
2. **Dynamic `robots.txt`:** 
   - Public pages ko Google index kar lega par Private Dashboards (`/admin`, `/super-admin`, `/student`, `/teacher`, `/driver`) ko search se restrict kiya jayega taaki security bani rahe aur data leak na ho.
3. **Structured Data (JSON-LD) & Meta Tags:**
   - Main site par **Organization/SoftwareApplication** level ka tag hoga.
   - School subdomains par **EducationalOrganization** schema hoga, jo specific school ki location, logo aur details hold karega.

Yeh kaam mai code update karke server pe dalunga taaki website proper Google search ke liye SEO ready ho jaye.

---

## Step 3: School Owners Ka Role (On-page SEO)

Google me subdomains (schools) ki acchi ranking ke liye aapko school owners (School Admin) ko yeh batana chahiye:
- **System me details fill karein:** Jab bhi koi naya school add karein, "School Settings" page me us school ka real **School Name**, **Address**, **Phone Number**, aur **Hero Description** properly dalein. 
- Ye details directly website ke front tag aur Google SEO code me jate hai. Agar ye section khali honge toh Google us school ki site ko index/rank nahi karega!

---

### Abhi Kya Karein?
Main (AI) backend me `sitemap.ts` aur `robots.ts` implement karunga (jaise mere plan me likha hai). Aap mean-while, **Step 1** follow karke Google Search Console pe apna domain `genschoolmail.in` add aur verify kar lijiye.
