import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    let adminPassword = process.env.ADMIN_PASSWORD;

    try {
      const ref = doc(db, "settings", "admin");
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data()?.password) {
        adminPassword = snap.data().password;
      }
    } catch (e) {
      console.error("Failed to read admin password from Firestore, falling back to ENV", e);
    }

    if (!adminPassword) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
