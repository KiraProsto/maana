import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const inventoryPath = path.join(process.cwd(), 'data', 'inventory.json');

async function readInventory(): Promise<Record<string, number>> {
  try {
    const raw = await fs.readFile(inventoryPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeInventory(data: Record<string, number>) {
  await fs.writeFile(inventoryPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const inventory = await readInventory();
  return NextResponse.json(inventory);
}

export async function PATCH(req: NextRequest) {
  const { items } = await req.json() as { items: { id: number; qty: number }[] };
  const inventory = await readInventory();

  for (const { id, qty } of items) {
    const key = String(id);
    if (inventory[key] !== undefined) {
      inventory[key] = Math.max(0, inventory[key] - qty);
    }
  }

  await writeInventory(inventory);
  return NextResponse.json({ ok: true });
}
