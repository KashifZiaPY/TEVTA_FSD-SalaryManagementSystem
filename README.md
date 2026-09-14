# TEVTA District Salary Management & Disbursement System (SMS-DES)

An enterprise-grade, corporate web application built for the **District Director Office, Technical Education & Vocational Training Authority (TEVTA) District Faisalabad & Chiniot**.

This system automates monthly salary preparation, validation, and disbursement for **Daily Wages Staff** and **Visiting Faculty** across 26+ technical institutes, colleges, and training centers (GVTIW, GATC, GTTI, GTTC, GCTW, GSTC, etc.).

---

## 🌟 Key Corporate Features

1. **Dual-Role Access Control**:
   - **Institute Portal**: Technical institutes authenticate via their **Institute Code (e.g., 33028)** and **Security PIN**. They can only view, enter, and verify claims for their own sanctioned staff.
   - **District Director Executive Hub**: Master oversight dashboard providing district-wide telemetry, submission progress across all 26+ campuses, and anomaly detection.
2. **Formula-Proof Math & Verification**:
   - **Daily Wages**: Auto-locks daily rates (Unskilled: Rs. 1,538/day, Skilled: Rs. 1,975/day). Input working days are capped at month calendar limits.
   - **Visiting Faculty**: Separate, validated inputs for **Theory Hours** (auto-calculated @ Rs. 500/hr) and **Practical Hours** (auto-calculated @ Rs. 250/hr), eliminating legacy Excel formula clutter (`=111+26` or `=27000+25000`).
3. **Automated BOP Bank Advice Generator**:
   - Strictly enforces **16-digit Bank of Punjab (BOP) account numbers** and branch codes.
   - 1-Click generates the official covering letter to the Manager, Bank of Punjab, routed to the correct account:
     - **Daily Wages**: Debited from **`TEVTA/NAVTEC/SALARIES A/C No. 5310027832200037`**.
     - **Visiting Faculty**: Debited from **`DM OFFICE NON SALARY A/C No. 5310006795600073`**.
   - Auto-converts numbers to English currency words (*"Six Million Nine Hundred Fifty Six Thousand..."*).
4. **Statutory HR Compliance & Audit Watchlist**:
   - **89-Day Statutory Contract Rule**: Flags employees approaching or exceeding the 89-day mandatory contract break limit.
   - **Anti-Ghost Staff & Duplicate CNIC Detection**: Scans across all institutes to prevent the same CNIC from being billed twice in the same month.
5. **Print-Perfect Consolidated Proformas**:
   - Generates official **Consolidated Statements** formatted to TEVTA Punjab AG Office standards.
   - Includes 1-Click CSV/Excel data export.
6. **Dual-Mode Backend Architecture**:
   - Operates standalone out of the box with persistent local storage.
   - Connects live to a **Headless Google Sheet** using the included Google Apps Script (`Code.gs`) REST API.

---

## 🔑 Demo & Evaluation Credentials

| User Role | Institute / Office | Code / Username | Security PIN | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **District Director** | DD Office Faisalabad & Chiniot | `33001` or `admin` | **`7101`** | Super Admin (Full District Oversight) |
| **Principal / In-Charge** | GVTIW Samanabad Faisalabad | `33028` | **`3302`** | Institute Access (Staff Claims) |
| **Principal / In-Charge** | GATC Faisalabad | `33010` | **`5412`** | Institute Access (Staff Claims) |
| **Principal / In-Charge** | GTTC (DMTC) Samundri | `33018` | **`8823`** | Institute Access (Staff Claims) |
| **Principal / In-Charge** | GTTI (B) Chiniot | `34001` | **`4102`** | Institute Access (Staff Claims) |

---

## 🚀 How to Deploy to GitHub & Vercel

This repository is configured for zero-config deployment to Vercel via GitHub:

### Step 1: Initialize Git Repository
In PowerShell or Terminal:
```bash
cd "e:\MKZ-GDrive 23082026\AntiGravity-Codings\TEVTA Salary\tevta-salary-portal"
git init
git add .
git commit -m "Initial commit: TEVTA District Salary Management System v1.0"
```

### Step 2: Push to Your GitHub Account
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/tevta-salary-portal.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New Project** $\rightarrow$ **Import** your `tevta-salary-portal` repository.
3. Vercel will automatically detect **Vite** framework preset. Click **Deploy**.
4. Your live corporate portal will be live in under 60 seconds with SSL!

---

## 📊 Connecting the Google Sheet Backend (Optional)

1. Open your master Google Sheet.
2. Go to **Extensions** $\rightarrow$ **Apps Script**.
3. Copy the script from `Code.gs` (located in the project folder) and paste it into Apps Script.
4. Run `setupDatabaseSchema` once to create the 5 relational database tabs.
5. Click **Deploy** $\rightarrow$ **New Deployment** $\rightarrow$ Select type **Web App**:
   - **Execute as**: *Me*
   - **Who has access**: *Anyone*
6. Copy the deployed Web App URL (`https://script.google.com/macros/s/.../exec`).
7. In the Web App, click the **Settings (gear icon)** in the top navbar and paste the URL into the **Google Apps Script Web App URL** field.
