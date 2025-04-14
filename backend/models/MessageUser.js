module.exports = (sequelize, DataTypes) => {
    const MessageUser = sequelize.define('MessageUser', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      messageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Messages',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
    }, {
      tableName: 'MessageUsers',
      timestamps: false, // No need for timestamps in a junction table
    });
  
    // No associations needed, as this is a junction table
    return MessageUser;
  };