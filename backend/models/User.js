module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'  // Default role
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,  // Optional field
      defaultValue: null
    }
  });

  User.associate = (models) => {
    // A user can send many messages
    User.hasMany(models.Message, {
      foreignKey: 'senderId',
      as: 'sentMessages',
    });
    // A user can be tagged in many messages (via MessageUser)
    User.belongsToMany(models.Message, {
      through: models.MessageUser,
      foreignKey: 'userId',
      as: 'taggedMessages',
    });
  };

  return User;
};
