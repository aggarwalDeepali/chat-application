const { Message, User, MessageUser, Sequelize } = require('../models');
const { Op } = Sequelize;

module.exports = {
  // POST /messages
  async createMessage(req, res) {
    try {
      const { content, taggedUserIds } = req.body;
      const senderId = req.user.id;

      if (req.user.role !== 'admin' && !Array.isArray(taggedUserIds)) {
        return res.status(400).json({ message: 'You must tag at least one user to send a message.' });
      }

      // Create the message
      const message = await Message.create({
        content,
        senderId: senderId,
      });

      // If the sender is a non-admin, automatically tag admins
      if (req.user.role !== 'admin') {
        // Find all admins (you could limit to specific admins or apply a filter)
        const admins = await User.findAll({ where: { role: 'admin' } });
        const adminIds = admins.map(admin => admin.id);

        // If admins exist, add them as tagged users
        if (adminIds.length > 0) {
          await message.addTaggedUsers(adminIds);
        }
      } else {
        // If sender is an admin, add tagged users if specified
        if (Array.isArray(taggedUserIds) && taggedUserIds.length > 0) {
          await message.addTaggedUsers(taggedUserIds);
        }
      }

      return res.status(201).json({ message: 'Message sent', data: message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // GET /messages
  async getMessages(req, res) {
    try {
      let messages;
  
      if (req.user.role === 'admin') {
        // Admin sees all messages
        messages = await Message.findAll({
          include: [
            { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
            { model: User, as: 'taggedUsers', attributes: ['id', 'name'] }
          ],
          order: [['createdAt', 'ASC']],
        });
      } else {
        // Non-admin users see:
        // - messages sent by admin
        // - messages they sent themselves
        // - AND (only if tagged OR if message is public)
        messages = await Message.findAll({
          include: [
            {
              model: User,
              as: 'sender',
              where: {
                [Op.or]: [
                  { role: 'admin' },
                  { id: req.user.id } // include messages sent by current user
                ]
              },
              attributes: ['id', 'name', 'role']
            },
            {
              model: User,
              as: 'taggedUsers',
              attributes: ['id', 'name'],
              required: false
            }
          ],
          order: [['createdAt', 'ASC']],
        });
  
        // Filter messages where:
        // - no tagged users (public)
        // - or current user is in taggedUsers
        // - or current user is the sender
        messages = messages.filter(msg => {
          const isSender = msg.sender.id === req.user.id;
          const isPublic = !msg.taggedUsers || msg.taggedUsers.length === 0;
          const isTagged = msg.taggedUsers.some(u => u.id === req.user.id);
          return isSender || isPublic || isTagged;
        });
      }
  
      return res.json({ data: messages });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  },  
  // GET /messages/:id
  async getMessageById(req, res) {
    try {
      const message = await Message.findByPk(req.params.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'role'] },
          { model: User, as: 'taggedUsers', attributes: ['id', 'name'] }
        ]
      });

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Access control
      if (req.user.role === 'admin') {
        return res.json({ data: message });
      }

      const isPublic = message.taggedUsers.length === 0;
      const isTagged = message.taggedUsers.some(u => u.id === req.user.id);
      const isFromAdmin = message.sender.role === 'admin';

      if (isFromAdmin && (isPublic || isTagged)) {
        return res.json({ data: message });
      }

      return res.status(403).json({ message: 'Not authorized to view this message' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // DELETE /messages/:id
  async deleteMessage(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can delete messages' });
      }

      const message = await Message.findByPk(req.params.id);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      await message.destroy();
      return res.json({ message: 'Message deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
};
