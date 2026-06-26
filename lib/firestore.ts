import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── User ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  hasAccess: boolean;
  createdAt: Timestamp;
  accessExpiresAt?: Timestamp | null;
}

function checkAndExpireAccess(profile: UserProfile): UserProfile {
  if (profile.hasAccess && profile.accessExpiresAt) {
    const expires = typeof profile.accessExpiresAt.toDate === "function"
      ? profile.accessExpiresAt.toDate()
      : new Date((profile.accessExpiresAt as any).seconds * 1000);
    if (expires < new Date()) {
      profile.hasAccess = false;
      // Update firestore asynchronously to revoke access
      updateDoc(doc(db, "users", profile.uid), { hasAccess: false }).catch(console.error);
    }
  }
  return profile;
}

export async function getOrCreateUser(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<UserProfile> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return checkAndExpireAccess(snap.data() as UserProfile);

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "User",
    photoURL: user.photoURL ?? "",
    hasAccess: false,
    createdAt: serverTimestamp() as Timestamp,
  };
  await setDoc(ref, profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return checkAndExpireAccess(snap.data() as UserProfile);
}

export async function grantAccess(uid: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await updateDoc(doc(db, "users", uid), {
    hasAccess: true,
    accessExpiresAt: Timestamp.fromDate(expiresAt),
  });
}

export async function revokeAccess(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    hasAccess: false,
    accessExpiresAt: null,
  });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(
    query(collection(db, "users"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => checkAndExpireAccess(d.data() as UserProfile));
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  screenshotUrl: string;
  status: PaymentStatus;
  aiVerified: boolean;
  aiReason: string;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
}

export async function submitPayment(data: {
  userId: string;
  userEmail: string;
  userDisplayName: string;
  screenshotUrl: string;
  aiVerified: boolean;
  aiReason: string;
  status: PaymentStatus;
}): Promise<string> {
  const ref = await addDoc(collection(db, "payments"), {
    ...data,
    submittedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllPayments(): Promise<Payment[]> {
  const snap = await getDocs(
    query(collection(db, "payments"), orderBy("submittedAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
}

export async function getPendingPayments(): Promise<Payment[]> {
  const snap = await getDocs(
    query(
      collection(db, "payments"),
      where("status", "==", "pending"),
      orderBy("submittedAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus
) {
  await updateDoc(doc(db, "payments", paymentId), {
    status,
    reviewedAt: serverTimestamp(),
  });
}

// ─── Content ─────────────────────────────────────────────────────────────────

export interface Content {
  id: string;
  title: string;
  description: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  isLocked: boolean;
  createdAt: Timestamp;
}

export async function addContent(data: Omit<Content, "id" | "createdAt">) {
  await addDoc(collection(db, "content"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getAllContent(): Promise<Content[]> {
  const snap = await getDocs(
    query(collection(db, "content"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Content));
}

export async function deleteContent(id: string) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "content", id));
}
