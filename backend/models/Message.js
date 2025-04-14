module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    tableName: 'Messages',
    timestamps: true,
  });

  Message.associate = (models) => {
    // A message belongs to one sender (User)
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender',
    });
    // A message can have multiple tagged users (via MessageUser)
    Message.belongsToMany(models.User, {
      through: models.MessageUser,
      foreignKey: 'messageId',
      as: 'taggedUsers',
    });
  };

  return Message;
};