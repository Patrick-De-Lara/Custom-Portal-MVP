import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Customer from './Customer';

interface BookingAttributes {
  id: number;
  customerId: number;
  servicem8_job_uuid?: string;
  title: string;
  description?: string;
  status: string;
  scheduledDate?: Date;
  completedDate?: Date;
  address?: string;
  total?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number;
  public customerId!: number;
  public servicem8_job_uuid?: string;
  public title!: string;
  public description?: string;
  public status!: string;
  public scheduledDate?: Date;
  public completedDate?: Date;
  public address?: string;
  public total?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    servicem8_job_uuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: true,
  }
);

// Associations
Customer.hasMany(Booking, {
  foreignKey: 'customerId',
  as: 'bookings',
});

Booking.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer',
});

export default Booking;
