require('dotenv').config();
const mongoose = require('mongoose');
const Field = require('../models/field');

const gtaFields = [
  {
    name: 'Downsview Sports Complex',
    description: 'Premium outdoor soccer facility featuring high-quality artificial turf. Perfect for competitive matches and training sessions. Features professional-grade lighting for evening games.',
    address: {
      street: '1750 Sheppard Ave W',
      city: 'Toronto',
      province: 'Ontario',
      postal_code: 'M3L 1Y3',
      coordinates: { lat: 43.7508, lng: -79.4808 }
    },
    images: [],
    field_type: 'turf',
    size: '11v11',
    amenities: ['parking', 'changing_rooms', 'showers', 'lighting', 'seating', 'refreshments'],
    operating_hours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '07:00', close: '22:00' }
    },
    hourly_rate: 180,
    contact: {
      phone: '416-555-0101',
      email: 'info@downsviewsports.com',
      website: 'https://downsviewsports.com'
    },
    rating: { average: 4.5, count: 127 }
  },
  {
    name: 'Scarborough Sports Centre',
    description: 'Modern indoor facility with FIFA-standard turf. Climate controlled environment ensures year-round play. Ideal for both recreational and competitive soccer.',
    address: {
      street: '2900 Birchmount Rd',
      city: 'Scarborough',
      province: 'Ontario',
      postal_code: 'M1T 2S5',
      coordinates: { lat: 43.7865, lng: -79.2975 }
    },
    images: [],
    field_type: 'indoor',
    size: '7v7',
    amenities: ['parking', 'changing_rooms', 'showers', 'equipment_rental', 'refreshments'],
    operating_hours: {
      monday: { open: '07:00', close: '23:00' },
      tuesday: { open: '07:00', close: '23:00' },
      wednesday: { open: '07:00', close: '23:00' },
      thursday: { open: '07:00', close: '23:00' },
      friday: { open: '07:00', close: '24:00' },
      saturday: { open: '06:00', close: '24:00' },
      sunday: { open: '06:00', close: '22:00' }
    },
    hourly_rate: 220,
    contact: {
      phone: '416-555-0102',
      email: 'bookings@scarboroughsports.com'
    },
    rating: { average: 4.7, count: 89 }
  },
  {
    name: 'Mississauga Valley Soccer Fields',
    description: 'Beautiful natural grass fields in a scenic park setting. Multiple fields available for tournaments and league play. Great parking and spectator areas.',
    address: {
      street: '1275 Mississauga Valley Blvd',
      city: 'Mississauga',
      province: 'Ontario',
      postal_code: 'L5A 3R8',
      coordinates: { lat: 43.5789, lng: -79.6205 }
    },
    images: [],
    field_type: 'grass',
    size: '11v11',
    amenities: ['parking', 'seating', 'lighting'],
    operating_hours: {
      monday: { open: '08:00', close: '21:00' },
      tuesday: { open: '08:00', close: '21:00' },
      wednesday: { open: '08:00', close: '21:00' },
      thursday: { open: '08:00', close: '21:00' },
      friday: { open: '08:00', close: '21:00' },
      saturday: { open: '08:00', close: '21:00' },
      sunday: { open: '08:00', close: '20:00' }
    },
    hourly_rate: 120,
    contact: {
      phone: '905-555-0103',
      email: 'fields@mississaugavalley.com'
    },
    rating: { average: 4.2, count: 156 }
  },
  {
    name: 'North York Indoor Soccer',
    description: 'State-of-the-art indoor futsal facility. Perfect for small-sided games and skill development. Air conditioned in summer, heated in winter.',
    address: {
      street: '4850 Yonge St',
      city: 'North York',
      province: 'Ontario',
      postal_code: 'M2N 6K1',
      coordinates: { lat: 43.7615, lng: -79.4109 }
    },
    images: [],
    field_type: 'indoor',
    size: 'futsal',
    amenities: ['parking', 'changing_rooms', 'showers', 'equipment_rental', 'refreshments'],
    operating_hours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '24:00' },
      saturday: { open: '07:00', close: '24:00' },
      sunday: { open: '07:00', close: '22:00' }
    },
    hourly_rate: 160,
    contact: {
      phone: '416-555-0104',
      email: 'play@nyindoorsoccer.com',
      website: 'https://nyindoorsoccer.com'
    },
    rating: { average: 4.6, count: 203 }
  },
  {
    name: 'Brampton Soccer Centre',
    description: 'Large multi-field complex featuring both indoor and outdoor options. Professional quality surfaces suitable for all skill levels. Home to several local leagues.',
    address: {
      street: '285 Chrysler Dr',
      city: 'Brampton',
      province: 'Ontario',
      postal_code: 'L6S 6G3',
      coordinates: { lat: 43.7315, lng: -79.7624 }
    },
    images: [],
    field_type: 'turf',
    size: '7v7',
    amenities: ['parking', 'changing_rooms', 'showers', 'lighting', 'seating', 'equipment_rental'],
    operating_hours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '23:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '08:00', close: '21:00' }
    },
    hourly_rate: 140,
    contact: {
      phone: '905-555-0105',
      email: 'info@bramptonsoccer.com'
    },
    rating: { average: 4.3, count: 178 }
  },
  {
    name: 'Etobicoke Olympium',
    description: 'Community sports complex with multiple soccer pitches. Well-maintained grass fields with excellent drainage. Popular for weekend leagues and tournaments.',
    address: {
      street: '590 Rathburn Rd',
      city: 'Etobicoke',
      province: 'Ontario',
      postal_code: 'M9C 3T3',
      coordinates: { lat: 43.6515, lng: -79.5548 }
    },
    images: [],
    field_type: 'grass',
    size: '11v11',
    amenities: ['parking', 'changing_rooms', 'lighting', 'seating'],
    operating_hours: {
      monday: { open: '08:00', close: '21:00' },
      tuesday: { open: '08:00', close: '21:00' },
      wednesday: { open: '08:00', close: '21:00' },
      thursday: { open: '08:00', close: '21:00' },
      friday: { open: '08:00', close: '21:00' },
      saturday: { open: '09:00', close: '20:00' },
      sunday: { open: '09:00', close: '20:00' }
    },
    hourly_rate: 110,
    contact: {
      phone: '416-555-0106',
      email: 'fields@etobicokeolympium.com'
    },
    rating: { average: 4.1, count: 92 }
  },
  {
    name: 'Markham Pan Am Centre',
    description: 'Legacy venue from the Pan Am Games. World-class facilities with premium artificial turf. Excellent accessibility and modern amenities throughout.',
    address: {
      street: '16 Main St N',
      city: 'Markham',
      province: 'Ontario',
      postal_code: 'L3P 1X7',
      coordinates: { lat: 43.8561, lng: -79.3370 }
    },
    images: [],
    field_type: 'turf',
    size: '11v11',
    amenities: ['parking', 'changing_rooms', 'showers', 'lighting', 'seating', 'refreshments'],
    operating_hours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '07:00', close: '21:00' }
    },
    hourly_rate: 200,
    contact: {
      phone: '905-555-0107',
      email: 'bookings@markhampanam.com',
      website: 'https://markhampanam.com'
    },
    rating: { average: 4.8, count: 245 }
  },
  {
    name: 'Vaughan Sportsplex',
    description: 'Premier sports facility in Vaughan featuring multiple 5-a-side pitches. Great for after-work games and corporate events. Indoor and outdoor options available.',
    address: {
      street: '1 Bass Pro Mills Dr',
      city: 'Vaughan',
      province: 'Ontario',
      postal_code: 'L4K 5W4',
      coordinates: { lat: 43.8256, lng: -79.5389 }
    },
    images: [],
    field_type: 'turf',
    size: '5v5',
    amenities: ['parking', 'changing_rooms', 'lighting', 'equipment_rental', 'refreshments'],
    operating_hours: {
      monday: { open: '07:00', close: '23:00' },
      tuesday: { open: '07:00', close: '23:00' },
      wednesday: { open: '07:00', close: '23:00' },
      thursday: { open: '07:00', close: '23:00' },
      friday: { open: '07:00', close: '24:00' },
      saturday: { open: '08:00', close: '24:00' },
      sunday: { open: '08:00', close: '22:00' }
    },
    hourly_rate: 130,
    contact: {
      phone: '905-555-0108',
      email: 'play@vaughansportsplex.com'
    },
    rating: { average: 4.4, count: 134 }
  }
];

const seedFields = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing fields
    await Field.deleteMany({});
    console.log('Cleared existing fields');

    // Insert new fields
    const result = await Field.insertMany(gtaFields);
    console.log(`Inserted ${result.length} fields`);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedFields();
}

module.exports = { gtaFields, seedFields };
