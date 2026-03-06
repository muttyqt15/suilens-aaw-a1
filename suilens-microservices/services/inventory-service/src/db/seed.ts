import { db } from './index';
import { branches, inventory } from './schema';

const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:3001';

const branchSeed = [
  { code: 'KB-JKT-S', name: 'Kebayoran Baru', location: 'Jakarta Selatan', notes: 'Studio utama, inventaris terbesar' },
  { code: 'KB-JKT-E', name: 'Jatinegara', location: 'Jakarta Timur', notes: 'Cabang sekunder' },
  { code: 'KB-JKT-N', name: 'Kelapa Gading', location: 'Jakarta Utara', notes: 'Cabang terbaru, stok terbatas' },
];

const stockPerBranch: Record<string, number> = {
  'KB-JKT-S': 3,
  'KB-JKT-E': 2,
  'KB-JKT-N': 1,
};

async function seed() {
  console.log('Seeding inventory data...');
  await db.insert(branches).values(branchSeed).onConflictDoNothing();

  const res = await fetch(`${CATALOG_SERVICE_URL}/api/lenses`);
  if (!res.ok) {
    throw new Error(`Failed to fetch lenses: ${res.status} ${res.statusText}`);
  }
  const lenses = await res.json() as { id: string }[];
  const inventoryRecords = [];
  for (const lens of lenses) {
    for (const [branchCode, qty] of Object.entries(stockPerBranch)) {
      inventoryRecords.push({
        lensId: lens.id,
        branchCode,
        totalQuantity: qty,
        availableQuantity: qty,
      });
    }
  }

  await db.insert(inventory).values(inventoryRecords).onConflictDoNothing();
  console.log(`Seeded ${inventoryRecords.length} inventory records.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
