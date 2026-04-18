import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { extractListingId, fetchListing, fetchCategories } from "@/lib/garageApi";
import InvoicePDF from "@/components/InvoicePDF";

async function generatePDF(listingId: string): Promise<{ buffer: Buffer; filename: string }> {
  const [listing, categories] = await Promise.all([
    fetchListing(listingId),
    fetchCategories(),
  ]);

  const element = createElement(InvoicePDF, { listing, categories }) as unknown as React.ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);
  const filename = `garage-invoice-${listing.secondaryId}.pdf`;

  return { buffer, filename };
}

async function sendEmail(to: string, buffer: Buffer, filename: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email service is not configured.");

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Garage Invoices <onboarding@resend.dev>",
    to,
    subject: "Your Garage Fire Truck Invoice",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#F97316;letter-spacing:2px;margin:0 0 8px">GARAGE</h2>
        <p style="color:#374151;margin:0 0 24px">
          Your PDF invoice is attached. Present it to your board for final approval.
        </p>
        <p style="color:#6B7280;font-size:13px">
          Questions? Reply to this email or visit
          <a href="https://www.shopgarage.com" style="color:#F97316">shopgarage.com</a>.
        </p>
      </div>
    `,
    attachments: [
      {
        filename,
        content: buffer.toString("base64"),
      },
    ],
  });

  if (error) throw new Error(error.message);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, email } = body as { url?: string; email?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    const listingId = extractListingId(url);
    if (!listingId) {
      return NextResponse.json(
        { error: "Could not find a valid listing ID in that URL." },
        { status: 400 }
      );
    }

    const { buffer, filename } = await generatePDF(listingId);

    // Send email if address provided
    if (email && typeof email === "string" && email.includes("@")) {
      try {
        await sendEmail(email, buffer, filename);
      } catch (emailErr) {
        // Return a partial-success response so the client still downloads
        return NextResponse.json(
          {
            emailError:
              emailErr instanceof Error
                ? emailErr.message
                : "Failed to send email.",
            pdf: Buffer.from(buffer).toString("base64"),
            filename,
          },
          { status: 207 }
        );
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate invoice.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
