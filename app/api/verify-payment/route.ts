import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { screenshotUrl } = await req.json();

    if (!screenshotUrl) {
      return NextResponse.json({ error: "No screenshot URL" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const gcashNumber = "09454320799";
    const price = process.env.NEXT_PUBLIC_PRICE ?? "280";

    const prompt = `You are a payment verification assistant. Analyze this GCash payment screenshot carefully.

Check ALL of the following:
1. Is this a successful GCash payment/transfer confirmation? (not pending, not failed)
2. Is the amount exactly ₱${price} or PHP ${price}?
3. Does the recipient number contain "${gcashNumber.replace(/-/g, "")}" or "${gcashNumber}"?
4. Is the payment date within the last 7 days? (Today is ${new Date().toLocaleDateString("en-PH")})

Respond ONLY with valid JSON in this exact format:
{
  "verified": true or false,
  "confidence": "high" or "medium" or "low",
  "reason": "brief explanation of your decision",
  "amountMatch": true or false,
  "recipientMatch": true or false,
  "statusSuccess": true or false,
  "dateRecent": true or false
}`;

    // Fetch the image and convert to base64
    const imageResponse = await fetch(screenshotUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") ?? "image/jpeg";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ]);

    const text = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        verified: false,
        confidence: "low",
        reason: "Could not parse AI response",
        amountMatch: false,
        recipientMatch: false,
        statusSuccess: false,
        dateRecent: false,
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Gemini verification error:", error);
    return NextResponse.json(
      {
        verified: false,
        confidence: "low",
        reason: "Verification service error. Will be reviewed manually.",
        amountMatch: false,
        recipientMatch: false,
        statusSuccess: false,
        dateRecent: false,
      },
      { status: 200 }
    );
  }
}
