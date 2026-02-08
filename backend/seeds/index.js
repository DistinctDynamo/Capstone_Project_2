require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Models
const User = require('../models/user');
const Team = require('../models/teams');
const Event = require('../models/events');
const Classified = require('../models/classified');
const Field = require('../models/field');
const Conversation = require('../models/conversation');
const Message = require('../models/message');

// Import field data
const { gtaFields } = require('./fields');

// Helper to hash passwords
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

// Sample users data - soroush is intentionally kept clean (no team, no events)
const createUsers = async () => {
  const hashedPassword = await hashPassword('password123');

  const users = [
    // SOROUSH - Your test user with NOTHING assigned
    {
      first_name: 'Soroush',
      last_name: 'Salari',
      email: 'soroush@test.com',
      username: 'soroush',
      password: hashedPassword,
      date_of_birth: new Date('1995-06-15'),
      skill_level: 'intermediate',
      position: 'midfielder',
      bio: 'Soccer enthusiast looking to join a team!',
      location: 'Toronto, Ontario',
      stats: {
        games_played: 0, goals: 0, assists: 0, clean_sheets: 0,
        pace: 75, shooting: 70, passing: 80, dribbling: 78, defending: 65, physical: 72
      },
      email_verified: true,
      user_type: 'player'
    },
    // Admin user
    {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@soccerconnect.com',
      username: 'admin',
      password: hashedPassword,
      date_of_birth: new Date('1990-01-01'),
      skill_level: 'competitive',
      position: 'midfielder',
      bio: 'Platform administrator',
      location: 'Toronto, Ontario',
      email_verified: true,
      user_type: 'admin'
    },
    // Other test users who WILL have teams and events
    {
      first_name: 'Marcus',
      last_name: 'Johnson',
      email: 'marcus@test.com',
      username: 'marcusj',
      password: hashedPassword,
      date_of_birth: new Date('1992-03-20'),
      skill_level: 'competitive',
      position: 'forward',
      bio: 'Former college player, now playing recreational leagues. Love the beautiful game!',
      location: 'Toronto, Ontario',
      stats: {
        games_played: 45, goals: 32, assists: 15, clean_sheets: 0,
        pace: 88, shooting: 85, passing: 72, dribbling: 80, defending: 45, physical: 78
      },
      email_verified: true,
      user_type: 'player'
    },
    {
      first_name: 'Sofia',
      last_name: 'Martinez',
      email: 'sofia@test.com',
      username: 'sofiam',
      password: hashedPassword,
      date_of_birth: new Date('1994-07-12'),
      skill_level: 'intermediate',
      position: 'midfielder',
      bio: 'Creative midfielder with an eye for the perfect pass.',
      location: 'Mississauga, Ontario',
      stats: {
        games_played: 28, goals: 8, assists: 22, clean_sheets: 0,
        pace: 75, shooting: 70, passing: 88, dribbling: 82, defending: 60, physical: 65
      },
      email_verified: true,
      user_type: 'player'
    },
    {
      first_name: 'David',
      last_name: 'Chen',
      email: 'david@test.com',
      username: 'davidc',
      password: hashedPassword,
      date_of_birth: new Date('1991-11-05'),
      skill_level: 'competitive',
      position: 'goalkeeper',
      bio: 'Shot stopper with quick reflexes. 5 years of competitive experience.',
      location: 'Markham, Ontario',
      stats: {
        games_played: 52, goals: 0, assists: 2, clean_sheets: 18,
        pace: 55, shooting: 30, passing: 65, dribbling: 40, defending: 85, physical: 80
      },
      email_verified: true,
      user_type: 'player'
    },
    {
      first_name: 'Emma',
      last_name: 'Wilson',
      email: 'emma@test.com',
      username: 'emmaw',
      password: hashedPassword,
      date_of_birth: new Date('1998-02-28'),
      skill_level: 'recreational',
      position: 'defender',
      bio: 'New to soccer but loving every minute of it!',
      location: 'Brampton, Ontario',
      stats: {
        games_played: 12, goals: 1, assists: 3, clean_sheets: 4,
        pace: 70, shooting: 50, passing: 65, dribbling: 55, defending: 75, physical: 72
      },
      email_verified: true,
      user_type: 'player'
    },
    {
      first_name: 'James',
      last_name: 'Williams',
      email: 'james@test.com',
      username: 'jamesw',
      password: hashedPassword,
      date_of_birth: new Date('1993-09-14'),
      skill_level: 'intermediate',
      position: 'defender',
      bio: 'Solid center-back. Good in the air and strong in the tackle.',
      location: 'Vaughan, Ontario',
      stats: {
        games_played: 38, goals: 5, assists: 4, clean_sheets: 12,
        pace: 68, shooting: 45, passing: 70, dribbling: 55, defending: 85, physical: 88
      },
      email_verified: true,
      user_type: 'player'
    },
    {
      first_name: 'Aisha',
      last_name: 'Patel',
      email: 'aisha@test.com',
      username: 'aishap',
      password: hashedPassword,
      date_of_birth: new Date('1996-04-22'),
      skill_level: 'competitive',
      position: 'midfielder',
      bio: 'Box-to-box midfielder with endless energy.',
      location: 'Scarborough, Ontario',
      stats: {
        games_played: 41, goals: 12, assists: 18, clean_sheets: 0,
        pace: 82, shooting: 72, passing: 78, dribbling: 75, defending: 70, physical: 80
      },
      email_verified: true,
      user_type: 'player'
    },
    {
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael@test.com',
      username: 'michaelb',
      password: hashedPassword,
      date_of_birth: new Date('1988-12-03'),
      skill_level: 'recreational',
      position: 'forward',
      bio: 'Weekend warrior who loves scoring goals!',
      location: 'North York, Ontario',
      stats: {
        games_played: 22, goals: 15, assists: 6, clean_sheets: 0,
        pace: 72, shooting: 78, passing: 60, dribbling: 68, defending: 35, physical: 70
      },
      email_verified: true,
      user_type: 'player'
    },
    {
      first_name: 'Lisa',
      last_name: 'Kim',
      email: 'lisa@test.com',
      username: 'lisak',
      password: hashedPassword,
      date_of_birth: new Date('1997-08-17'),
      skill_level: 'intermediate',
      position: 'midfielder',
      bio: 'Technical player who loves keeping possession.',
      location: 'Etobicoke, Ontario',
      stats: {
        games_played: 30, goals: 7, assists: 14, clean_sheets: 0,
        pace: 70, shooting: 65, passing: 85, dribbling: 88, defending: 55, physical: 60
      },
      email_verified: true,
      user_type: 'player'
    }
  ];

  return User.insertMany(users);
};

// Create teams - soroush is NOT a member of any team
const createTeams = async (users) => {
  const marcus = users.find(u => u.username === 'marcusj');
  const sofia = users.find(u => u.username === 'sofiam');
  const david = users.find(u => u.username === 'davidc');
  const emma = users.find(u => u.username === 'emmaw');
  const james = users.find(u => u.username === 'jamesw');
  const aisha = users.find(u => u.username === 'aishap');
  const michael = users.find(u => u.username === 'michaelb');
  const lisa = users.find(u => u.username === 'lisak');

  const teams = [
    {
      team_name: 'Toronto FC Legends',
      description: 'Competitive team looking for skilled players. We play in the GTA Premier League and train twice a week.',
      skill_level: 'competitive',
      captain: marcus._id,
      members: [
        { user: marcus._id, role: 'captain', position: 'striker', jersey_number: 9 },
        { user: david._id, role: 'member', position: 'goalkeeper', jersey_number: 1 },
        { user: aisha._id, role: 'co-captain', position: 'midfielder', jersey_number: 8 },
        { user: james._id, role: 'member', position: 'defender', jersey_number: 4 }
      ],
      location: { city: 'Toronto', province: 'Ontario' },
      home_field: 'Downsview Sports Complex',
      practice_schedule: 'Tuesdays & Thursdays 7-9 PM',
      stats: { wins: 12, losses: 3, draws: 2, goals_for: 38, goals_against: 15 },
      recruiting_status: {
        is_recruiting: true,
        positions: ['midfielder', 'defender'],
        message: 'Looking for committed players who can attend regular training sessions.'
      },
      founded_year: 2021,
      approval_status: 'approved'
    },
    {
      team_name: 'Mississauga United',
      description: 'Friendly intermediate team focused on having fun while staying competitive. All skill levels welcome!',
      skill_level: 'intermediate',
      captain: sofia._id,
      members: [
        { user: sofia._id, role: 'captain', position: 'midfielder', jersey_number: 10 },
        { user: lisa._id, role: 'member', position: 'midfielder', jersey_number: 7 },
        { user: emma._id, role: 'member', position: 'defender', jersey_number: 3 }
      ],
      location: { city: 'Mississauga', province: 'Ontario' },
      home_field: 'Mississauga Valley Soccer Fields',
      practice_schedule: 'Saturdays 10 AM - 12 PM',
      stats: { wins: 8, losses: 5, draws: 4, goals_for: 25, goals_against: 22 },
      recruiting_status: {
        is_recruiting: true,
        positions: ['goalkeeper', 'striker'],
        message: 'Looking for players who want to improve and have fun!'
      },
      founded_year: 2022,
      approval_status: 'approved'
    },
    {
      team_name: 'Sunday Strikers',
      description: 'Casual recreational team that plays pickup games on Sundays. No commitment required!',
      skill_level: 'recreational',
      captain: michael._id,
      members: [
        { user: michael._id, role: 'captain', position: 'striker', jersey_number: 11 }
      ],
      location: { city: 'North York', province: 'Ontario' },
      home_field: 'North York Indoor Soccer',
      practice_schedule: 'Sundays 2-4 PM',
      stats: { wins: 5, losses: 7, draws: 3, goals_for: 20, goals_against: 28 },
      recruiting_status: {
        is_recruiting: true,
        positions: ['any'],
        message: 'Everyone welcome! Just show up and play.'
      },
      founded_year: 2023,
      approval_status: 'approved'
    },
    // A pending team for admin testing
    {
      team_name: 'New Stars FC',
      description: 'Brand new team looking to make a name in the league.',
      skill_level: 'intermediate',
      captain: emma._id,
      members: [
        { user: emma._id, role: 'captain', position: 'defender', jersey_number: 5 }
      ],
      location: { city: 'Brampton', province: 'Ontario' },
      recruiting_status: { is_recruiting: true, positions: ['any'] },
      founded_year: 2024,
      approval_status: 'pending'
    }
  ];

  return Team.insertMany(teams);
};

// Create events - soroush is NOT attending any events
const createEvents = async (users, fields) => {
  const marcus = users.find(u => u.username === 'marcusj');
  const sofia = users.find(u => u.username === 'sofiam');
  const michael = users.find(u => u.username === 'michaelb');
  const david = users.find(u => u.username === 'davidc');
  const aisha = users.find(u => u.username === 'aishap');

  const downsview = fields.find(f => f.name.includes('Downsview'));
  const scarborough = fields.find(f => f.name.includes('Scarborough'));
  const mississauga = fields.find(f => f.name.includes('Mississauga'));
  const northYork = fields.find(f => f.name.includes('North York'));

  // Future dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const in2Weeks = new Date();
  in2Weeks.setDate(in2Weeks.getDate() + 14);

  const events = [
    {
      title: 'Weekly Pickup Game - Downsview',
      description: 'Regular weekly pickup game. All skill levels welcome! We split teams fairly and rotate players.',
      event_type: 'pickup_game',
      organizer: marcus._id,
      date: tomorrow,
      start_time: '19:00',
      end_time: '21:00',
      location: {
        name: downsview?.name || 'Downsview Sports Complex',
        address: '1750 Sheppard Ave W, Toronto',
        coordinates: { lat: 43.7508, lng: -79.4808 }
      },
      max_participants: 22,
      skill_level: 'all',
      cost: 10,
      attendees: [
        { user: marcus._id, status: 'going' },
        { user: david._id, status: 'going' },
        { user: aisha._id, status: 'going' }
      ],
      status: 'upcoming',
      visibility: 'public',
      approval_status: 'approved'
    },
    {
      title: 'Intermediate Training Session',
      description: 'Focused training session on passing and movement. Coach-led drills and small-sided games.',
      event_type: 'training',
      organizer: sofia._id,
      date: nextWeek,
      start_time: '10:00',
      end_time: '12:00',
      location: {
        name: mississauga?.name || 'Mississauga Valley Soccer Fields',
        address: '1275 Mississauga Valley Blvd, Mississauga'
      },
      max_participants: 16,
      skill_level: 'intermediate',
      cost: 15,
      attendees: [
        { user: sofia._id, status: 'going' }
      ],
      status: 'upcoming',
      visibility: 'public',
      approval_status: 'approved'
    },
    {
      title: 'Sunday Funday - Casual Kick',
      description: 'No pressure, just fun! Bring your friends and family. We have extra balls and bibs.',
      event_type: 'pickup_game',
      organizer: michael._id,
      date: nextWeek,
      start_time: '14:00',
      end_time: '16:00',
      location: {
        name: northYork?.name || 'North York Indoor Soccer',
        address: '4850 Yonge St, North York'
      },
      max_participants: 20,
      skill_level: 'recreational',
      cost: 0,
      attendees: [
        { user: michael._id, status: 'going' }
      ],
      status: 'upcoming',
      visibility: 'public',
      approval_status: 'approved'
    },
    {
      title: 'Competitive 7v7 Tournament',
      description: 'Single day tournament with prizes! Teams of 7 compete for glory and bragging rights.',
      event_type: 'tournament',
      organizer: marcus._id,
      date: in2Weeks,
      start_time: '09:00',
      end_time: '17:00',
      location: {
        name: scarborough?.name || 'Scarborough Sports Centre',
        address: '2900 Birchmount Rd, Scarborough'
      },
      max_participants: 56,
      skill_level: 'competitive',
      cost: 25,
      attendees: [
        { user: marcus._id, status: 'going' },
        { user: aisha._id, status: 'going' }
      ],
      status: 'upcoming',
      visibility: 'public',
      approval_status: 'approved'
    },
    // A pending event for admin testing
    {
      title: 'Night League Tryouts',
      description: 'Tryouts for our competitive night league team.',
      event_type: 'tryout',
      organizer: david._id,
      date: in2Weeks,
      start_time: '20:00',
      end_time: '22:00',
      location: {
        name: 'Downsview Sports Complex',
        address: '1750 Sheppard Ave W, Toronto'
      },
      max_participants: 30,
      skill_level: 'competitive',
      cost: 0,
      attendees: [
        { user: david._id, status: 'going' }
      ],
      status: 'upcoming',
      visibility: 'public',
      approval_status: 'pending'
    }
  ];

  return Event.insertMany(events);
};

// Create classifieds - soroush has no listings
const createClassifieds = async (users) => {
  const marcus = users.find(u => u.username === 'marcusj');
  const sofia = users.find(u => u.username === 'sofiam');
  const emma = users.find(u => u.username === 'emmaw');
  const james = users.find(u => u.username === 'jamesw');

  const classifieds = [
    {
      title: 'Nike Mercurial Vapor 15 - Size 10',
      description: 'Barely used Nike Mercurial Vapor 15 Elite boots. Worn only 3 times. Selling because they are too tight for me. Original box included.',
      ad_type: 'equipment_sale',
      poster: marcus._id,
      price: 180,
      condition: 'like_new',
      location: { city: 'Toronto', province: 'Ontario' },
      contact_method: 'message',
      status: 'active'
    },
    {
      title: 'Looking for Striker - Competitive League',
      description: 'Our team needs a clinical finisher for the upcoming fall season. Must be available for Tuesday evening games and Sunday morning training.',
      ad_type: 'looking_for_players',
      poster: sofia._id,
      location: { city: 'Mississauga', province: 'Ontario' },
      contact_method: 'both',
      status: 'active'
    },
    {
      title: 'Free Soccer Balls - Used but Good Condition',
      description: 'Giving away 5 match balls. Some wear but still perfectly usable for training.',
      ad_type: 'equipment_sale',
      poster: james._id,
      price: 0,
      condition: 'good',
      location: { city: 'Vaughan', province: 'Ontario' },
      contact_method: 'message',
      status: 'active'
    },
    {
      title: 'Looking for a Team - Recreational Level',
      description: "Hi! I'm new to the area and looking for a friendly team to join. I play defender but can fill in anywhere. Available weekends.",
      ad_type: 'looking_for_team',
      poster: emma._id,
      location: { city: 'Brampton', province: 'Ontario' },
      contact_method: 'both',
      status: 'active'
    },
    {
      title: 'Goalkeeper Gloves - Adidas Predator',
      description: 'Size 9 goalkeeper gloves. Great grip, used for one season. Minor palm wear.',
      ad_type: 'equipment_sale',
      poster: marcus._id,
      price: 45,
      condition: 'good',
      location: { city: 'Toronto', province: 'Ontario' },
      contact_method: 'message',
      status: 'active'
    }
  ];

  return Classified.insertMany(classifieds);
};

// Main seed function
const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Clear all collections
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Event.deleteMany({}),
      Classified.deleteMany({}),
      Field.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({})
    ]);
    console.log('Cleared all collections\n');

    // Seed fields
    console.log('Seeding fields...');
    const fields = await Field.insertMany(gtaFields);
    console.log(`✓ Created ${fields.length} fields\n`);

    // Seed users
    console.log('Seeding users...');
    const users = await createUsers();
    console.log(`✓ Created ${users.length} users`);
    console.log('  - soroush (YOUR TEST USER - has nothing assigned)');
    console.log('  - admin (platform admin)');
    console.log('  - Other users have teams and events\n');

    // Seed teams
    console.log('Seeding teams...');
    const teams = await createTeams(users);
    console.log(`✓ Created ${teams.length} teams`);
    console.log('  - 3 approved teams');
    console.log('  - 1 pending team (for admin testing)\n');

    // Seed events
    console.log('Seeding events...');
    const events = await createEvents(users, fields);
    console.log(`✓ Created ${events.length} events`);
    console.log('  - 4 approved events');
    console.log('  - 1 pending event (for admin testing)\n');

    // Seed classifieds
    console.log('Seeding classifieds...');
    const classifieds = await createClassifieds(users);
    console.log(`✓ Created ${classifieds.length} classifieds\n`);

    console.log('='.repeat(50));
    console.log('SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\nTest accounts:');
    console.log('  Email: soroush@test.com | Password: password123 (empty user)');
    console.log('  Email: admin@soccerconnect.com | Password: password123 (admin)');
    console.log('  Email: marcus@test.com | Password: password123 (has team + events)');
    console.log('\nNote: soroush user has NO team and NO events - perfect for testing empty states!');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
