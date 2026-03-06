// src/db/seed.ts
import { db } from './index';
import { lenses } from './schema';

const seedLenses = [
  {
    modelName: 'Summilux-M 35mm f/1.4 ASPH.',
    manufacturerName: 'Leica',
    minFocalLength: 35,
    maxFocalLength: 35,
    maxAperture: '1.4',
    mountType: 'Leica M',
    dayPrice: '450000.00',
    weekendPrice: '750000.00',
    description: 'A legendary 35mm lens renowned for its rendering and character. The aspherical version delivers stunning sharpness wide open with beautiful bokeh.',
  },
  {
    modelName: 'Art 24-70mm f/2.8 DG DN',
    manufacturerName: 'Sigma',
    minFocalLength: 24,
    maxFocalLength: 70,
    maxAperture: '2.8',
    mountType: 'Sony E',
    dayPrice: '200000.00',
    weekendPrice: '350000.00',
    description: 'Professional-grade standard zoom for mirrorless systems. Sharp across the entire range with fast, reliable autofocus.',
  },
  {
    modelName: 'NIKKOR Z 70-200mm f/2.8 VR S',
    manufacturerName: 'Nikon',
    minFocalLength: 70,
    maxFocalLength: 200,
    maxAperture: '2.8',
    mountType: 'Nikon Z',
    dayPrice: '350000.00',
    weekendPrice: '600000.00',
    description: 'Nikon\'s flagship telephoto zoom for the Z system. Exceptional optical performance with built-in VR and near-silent autofocus for video work.',
  },
  {
    modelName: 'CN-E 50mm T1.3 L F',
    manufacturerName: 'Canon',
    minFocalLength: 50,
    maxFocalLength: 50,
    maxAperture: '1.3',
    mountType: 'Canon EF (Cinema)',
    dayPrice: '500000.00',
    weekendPrice: '850000.00',
    description: 'Cinema prime lens with smooth focus throw and minimal breathing. T1.3 aperture delivers cinematic depth-of-field control in low light.',
  },
  {
    modelName: 'Vario-Tessar T* FE 16-35mm f/4 ZA OSS',
    manufacturerName: 'Sony (Zeiss)',
    minFocalLength: 16,
    maxFocalLength: 35,
    maxAperture: '4.0',
    mountType: 'Sony E',
    dayPrice: '175000.00',
    weekendPrice: '300000.00',
    description: 'Compact wide-angle zoom with Zeiss optics. Ideal for landscapes, architecture, and establishing shots. Built-in OSS for handheld video.',
  },
];

async function seed() {
  console.log('Seeding lenses...');
  await db.insert(lenses).values(seedLenses);
  console.log(`Seeded ${seedLenses.length} lenses.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
