/**
 * Script to create team chats for existing teams that don't have one
 * Run with: node scripts/createTeamChats.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('../models/teams');
const User = require('../models/user');
const Conversation = require('../models/conversation');

const createTeamChats = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all teams
    const teams = await Team.find({}).populate('members.user', 'first_name username');

    let created = 0;
    let skipped = 0;

    for (const team of teams) {
      // Check if team chat already exists
      const existingChat = await Conversation.findOne({ team: team._id, type: 'team' });

      if (existingChat) {
        console.log(`Team "${team.team_name}" already has a chat`);
        skipped++;
        continue;
      }

      // Create team chat with all current members
      const memberIds = team.members.map(m => m.user._id || m.user);

      const conversation = await Conversation.create({
        type: 'team',
        team: team._id,
        name: `${team.team_name} Team Chat`,
        participants: memberIds
      });

      console.log(`Created chat for team "${team.team_name}" with ${memberIds.length} participants`);
      created++;
    }

    console.log(`\nDone! Created ${created} team chats, skipped ${skipped} existing.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTeamChats();
