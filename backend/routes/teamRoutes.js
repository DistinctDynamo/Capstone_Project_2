const express = require('express');
const Team = require('../models/teams');
const User = require('../models/user');
const { protect, optionalAuth } = require('../middleware/auth');
const { teamValidation, mongoIdValidation, paginationValidation } = require('../middleware/validators');

const router = express.Router();

// @route   GET /api/teams
// @desc    Get all teams with filters and pagination
// @access  Public
router.get('/', optionalAuth, paginationValidation, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter - only show approved teams to public
    const filter = { approval_status: 'approved' };

    if (req.query.is_recruiting === 'true') {
      filter.is_recruiting = true;
    }

    if (req.query.skill_level) {
      filter.skill_level = req.query.skill_level;
    }

    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const teams = await Team.find(filter)
      .populate('owner', 'username first_name last_name avatar')
      .populate('members.user', 'username first_name last_name avatar position')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Team.countDocuments(filter);

    res.json({
      success: true,
      data: {
        teams,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/teams/user/my-team
// @desc    Get current user's team
// @access  Private
router.get('/user/my-team', protect, async (req, res, next) => {
  try {
    if (!req.user.team) {
      return res.json({
        success: true,
        data: { team: null }
      });
    }

    const team = await Team.findById(req.user.team)
      .populate('owner', 'username first_name last_name avatar')
      .populate('members.user', 'username first_name last_name avatar position stats')
      .populate('applications.user', 'username first_name last_name avatar position');

    res.json({
      success: true,
      data: { team }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/teams/user/invitations
// @desc    Get pending invitations for current user
// @access  Private
router.get('/user/invitations', protect, async (req, res, next) => {
  try {
    const teams = await Team.find({
      'invitations.user': req.user._id,
      'invitations.status': 'pending'
    })
      .select('team_name logo location skill_level invitations')
      .populate('owner', 'username first_name last_name');

    const invitations = teams.map(team => {
      const invitation = team.invitations.find(
        i => i.user.toString() === req.user._id.toString() && i.status === 'pending'
      );
      return {
        team: {
          _id: team._id,
          team_name: team.team_name,
          logo: team.logo,
          location: team.location,
          skill_level: team.skill_level,
          owner: team.owner
        },
        invitation: {
          _id: invitation._id,
          sent_at: invitation.sent_at
        }
      };
    });

    res.json({
      success: true,
      data: { invitations }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/teams/:id
// @desc    Get single team
// @access  Public (but non-approved teams only visible to owner/members/admin)
router.get('/:id', optionalAuth, mongoIdValidation, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'username first_name last_name avatar email')
      .populate('members.user', 'username first_name last_name avatar position stats')
      .populate('invitations.user', 'username first_name last_name avatar')
      .populate('applications.user', 'username first_name last_name avatar position');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if team is approved or if user is owner/member/admin
    const isOwner = req.user && team.owner._id.toString() === req.user._id.toString();
    const isMember = req.user && team.members.some(m => m.user._id.toString() === req.user._id.toString());
    const isAdmin = req.user && req.user.user_type === 'admin';

    if (team.approval_status !== 'approved' && !isOwner && !isMember && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.json({
      success: true,
      data: { team }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/teams
// @desc    Create a new team
// @access  Private
router.post('/', protect, teamValidation, async (req, res, next) => {
  try {
    // Check if user already owns a team
    const existingTeam = await Team.findOne({ owner: req.user._id });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'You already own a team'
      });
    }

    // Check if user is already in a team
    if (req.user.team) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of a team. Leave your current team first.'
      });
    }

    const teamData = {
      ...req.body,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner',
        joined_at: new Date()
      }]
    };

    const team = await Team.create(teamData);

    // Update user with team reference
    await User.findByIdAndUpdate(req.user._id, {
      team: team._id,
      team_role: 'owner'
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'username first_name last_name avatar')
      .populate('members.user', 'username first_name last_name avatar');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team: populatedTeam }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/teams/:id
// @desc    Update team
// @access  Private (owner or captain)
router.put('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check authorization (owner or captain)
    const member = team.members.find(m => m.user.toString() === req.user._id.toString());
    const isAuthorized = team.owner.toString() === req.user._id.toString() ||
      (member && ['owner', 'captain'].includes(member.role)) ||
      req.user.user_type === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this team'
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'team_name', 'description', 'logo', 'location',
      'skill_level', 'preferred_positions', 'max_members', 'is_recruiting'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    team = await Team.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('owner', 'username first_name last_name avatar')
      .populate('members.user', 'username first_name last_name avatar');

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: { team }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/teams/:id
// @desc    Delete team
// @access  Private (owner only)
router.delete('/:id', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check ownership
    if (team.owner.toString() !== req.user._id.toString() && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the team owner can delete the team'
      });
    }

    // Remove team reference from all members
    const memberIds = team.members.map(m => m.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { team: null, team_role: '' }
    );

    await Team.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/teams/:id/apply
// @desc    Apply to join a team
// @access  Private
router.post('/:id/apply', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (!team.is_recruiting) {
      return res.status(400).json({
        success: false,
        message: 'This team is not currently recruiting'
      });
    }

    if (team.members.length >= team.max_members) {
      return res.status(400).json({
        success: false,
        message: 'Team is full'
      });
    }

    // Check if already a member
    const isMember = team.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }

    // Check if already applied
    const hasApplied = team.applications.some(
      a => a.user.toString() === req.user._id.toString() && a.status === 'pending'
    );
    if (hasApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this team'
      });
    }

    team.applications.push({
      user: req.user._id,
      message: req.body.message || '',
      status: 'pending',
      applied_at: new Date()
    });

    await team.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/teams/:id/applications/:applicationId
// @desc    Accept or reject an application
// @access  Private (owner or captain)
router.put('/:id/applications/:applicationId', protect, async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be accepted or rejected'
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check authorization
    const member = team.members.find(m => m.user.toString() === req.user._id.toString());
    const isAuthorized = team.owner.toString() === req.user._id.toString() ||
      (member && ['owner', 'captain'].includes(member.role));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage applications'
      });
    }

    const application = team.applications.id(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed'
      });
    }

    application.status = status;

    if (status === 'accepted') {
      // Check if team is full
      if (team.members.length >= team.max_members) {
        return res.status(400).json({
          success: false,
          message: 'Team is full'
        });
      }

      // Add user to team
      team.members.push({
        user: application.user,
        role: 'member',
        joined_at: new Date()
      });

      // Update user
      await User.findByIdAndUpdate(application.user, {
        team: team._id,
        team_role: 'member'
      });
    }

    await team.save();

    res.json({
      success: true,
      message: `Application ${status}`
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/teams/:id/invite
// @desc    Invite a user to join the team
// @access  Private (owner or captain)
router.post('/:id/invite', protect, mongoIdValidation, async (req, res, next) => {
  try {
    const { userId } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check authorization
    const member = team.members.find(m => m.user.toString() === req.user._id.toString());
    const isAuthorized = team.owner.toString() === req.user._id.toString() ||
      (member && ['owner', 'captain'].includes(member.role));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to invite members'
      });
    }

    // Check if user exists
    const userToInvite = await User.findById(userId);
    if (!userToInvite) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already in a team
    if (userToInvite.team) {
      return res.status(400).json({
        success: false,
        message: 'User is already in a team'
      });
    }

    // Check if already invited
    const hasInvitation = team.invitations.some(
      i => i.user.toString() === userId && i.status === 'pending'
    );
    if (hasInvitation) {
      return res.status(400).json({
        success: false,
        message: 'User has already been invited'
      });
    }

    team.invitations.push({
      user: userId,
      status: 'pending',
      sent_at: new Date()
    });

    await team.save();

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/teams/:id/invitations/:invitationId
// @desc    Respond to team invitation
// @access  Private (invited user)
router.put('/:id/invitations/:invitationId', protect, async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' or 'declined'

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be accepted or declined'
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const invitation = team.invitations.id(req.params.invitationId);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if this invitation belongs to the current user
    if (invitation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This invitation is not for you'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation has already been processed'
      });
    }

    invitation.status = status;

    if (status === 'accepted') {
      // Check if team is full
      if (team.members.length >= team.max_members) {
        return res.status(400).json({
          success: false,
          message: 'Team is full'
        });
      }

      // Add user to team
      team.members.push({
        user: req.user._id,
        role: 'member',
        joined_at: new Date()
      });

      // Update user
      await User.findByIdAndUpdate(req.user._id, {
        team: team._id,
        team_role: 'member'
      });
    }

    await team.save();

    res.json({
      success: true,
      message: `Invitation ${status}`
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/teams/:id/members/:memberId/role
// @desc    Update member role
// @access  Private (owner only)
router.put('/:id/members/:memberId/role', protect, async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['captain', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be captain or member'
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Only owner can change roles
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can change member roles'
      });
    }

    const member = team.members.find(m => m.user.toString() === req.params.memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    if (member.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change owner role'
      });
    }

    member.role = role;
    await team.save();

    // Update user
    await User.findByIdAndUpdate(req.params.memberId, { team_role: role });

    res.json({
      success: true,
      message: 'Member role updated'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/teams/:id/members/:memberId
// @desc    Remove member from team
// @access  Private (owner, captain, or self)
router.delete('/:id/members/:memberId', protect, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const memberToRemove = team.members.find(m => m.user.toString() === req.params.memberId);

    if (!memberToRemove) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Cannot remove owner
    if (memberToRemove.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove team owner. Transfer ownership or delete the team.'
      });
    }

    // Check authorization (owner, captain, or leaving self)
    const currentMember = team.members.find(m => m.user.toString() === req.user._id.toString());
    const isSelf = req.params.memberId === req.user._id.toString();
    const isAuthorized = team.owner.toString() === req.user._id.toString() ||
      (currentMember && currentMember.role === 'captain') ||
      isSelf;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this member'
      });
    }

    team.members = team.members.filter(m => m.user.toString() !== req.params.memberId);
    await team.save();

    // Update user
    await User.findByIdAndUpdate(req.params.memberId, {
      team: null,
      team_role: ''
    });

    res.json({
      success: true,
      message: isSelf ? 'You have left the team' : 'Member removed from team'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
