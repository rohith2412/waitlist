import { MongoClient } from "mongodb";

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  return global._mongoClientPromise;
}

export async function getCollection() {
  const client = await getClientPromise();
  const db = client.db(process.env.MONGODB_DB || "waitlist");
  return db.collection(process.env.MONGODB_COLLECTION || "emails");
}
