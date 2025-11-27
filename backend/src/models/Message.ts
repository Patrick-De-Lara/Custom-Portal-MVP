import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Booking from './Booking';
import Customer from './Customer';

interface MessageAttributes {
  id: number;
  bookingId: number;
  customerId: number;
  content: string;
  senderType: 'customer' | 'admin';
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public bookingId!: number;
  public customerId!: number;
  public content!: string;
  public senderType!: 'customer' | 'admin';
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id',
      },
    },
    customerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderType: {
      type: DataTypes.ENUM('customer', 'admin'),
      allowNull: false,
      defaultValue: 'customer',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
  }
);

// Associations
Booking.hasMany(Message, {
  foreignKey: 'bookingId',
  as: 'messages',
});

Message.belongsTo(Booking, {
  foreignKey: 'bookingId',
  as: 'booking',
});

Customer.hasMany(Message, {
  foreignKey: 'customerId',
  as: 'messages',
});

Message.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer',
});

export default Message;
