const { User, Sequelize } = require('../models');
const { Op } = Sequelize;

module.exports = {
    // Controller function to get all users except the logged-in one
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                where: {
                    id: { [Op.ne]: req.user.id } // Exclude the logged-in user
                }
            });

            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    },
};
