# Garage — Fire Truck Invoice Generator

A Next.js app that generates a PDF invoice for any fire truck listing on [Garage](https://www.shopgarage.com). Paste a listing URL, download a board-ready invoice, and optionally email it directly.

## Features

- Paste any Garage listing URL to generate a PDF invoice
- Invoice includes the truck's title, price, full description, specs, and image
- Download the PDF directly or send it to an email address
- Responsive dark UI styled to match Garage's brand

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Email (optional)

Copy `.env.local.example` to `.env.local` and add your [Resend](https://resend.com) API key:

```
RESEND_API_KEY=re_your_key_here
```

Email sending degrades gracefully — if no key is set, the PDF still downloads.

> **Note on Resend's free tier:** Without a verified sending domain, Resend restricts outbound email to the account owner's address only. To send invoices to any recipient (e.g. fire department contacts), a domain would need to be verified at [resend.com/domains](https://resend.com/domains) and the `from` address updated to use that domain. This is a straightforward production step for Garage to complete.

## How it works

1. The UUID is extracted from the pasted listing URL
2. `GET https://garage-backend.onrender.com/listings/:id` fetches full listing data
3. `GET https://garage-backend.onrender.com/categories` resolves attribute labels
4. `@react-pdf/renderer` renders a styled A4 invoice server-side
5. The PDF is streamed back as a download (and optionally emailed via Resend)

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS**
- **@react-pdf/renderer** — server-side PDF generation
- **Resend** — transactional email
