import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { CustomerOrder, BankDetails } from './types';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'teleshop_db';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient | null; db: Db | null }> {
  if (!MONGODB_URI) {
    return { client: null, db: null };
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Fallback JSON filesystem helpers for local dev when MONGODB_URI is not set
const DATA_DIR = path.join(process.cwd(), '.data');

function ensureFileExists(filename: string, defaultData: any) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
  return filePath;
}

export function readLocalJson<T>(filename: string, defaultData: T): T {
  try {
    const filePath = ensureFileExists(filename, defaultData);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

export function writeLocalJson<T>(filename: string, data: T) {
  const filePath = ensureFileExists(filename, data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
