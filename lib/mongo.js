import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set");

let clientPromise;
if (!global._mongoClientPromise) {
  global._mongoClientPromise = new MongoClient(uri).connect();
}
clientPromise = global._mongoClientPromise;

export async function getCollection() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "waitlist");
  return db.collection(process.env.MONGODB_COLLECTION || "emails");
}
