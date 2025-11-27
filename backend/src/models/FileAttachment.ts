import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Booking from './Booking';

interface FileAttachmentAttributes {
  id: number;
  bookingId: number;
  servicem8_attachment_uuid?: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FileAttachmentCreationAttributes extends Optional<FileAttachmentAttributes, 'id'> {}

class FileAttachment extends Model<FileAttachmentAttributes, FileAttachmentCreationAttributes> implements FileAttachmentAttributes {
  public id!: number;
  public bookingId!: number;
  public servicem8_attachment_uuid?: string;
  public fileName!: string;
  public fileUrl!: string;
  public fileType?: string;
  public fileSize?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FileAttachment.init(
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
    servicem8_attachment_uuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'file_attachments',
    timestamps: true,
  }
);

// Associations
Booking.hasMany(FileAttachment, {
  foreignKey: 'bookingId',
  as: 'attachments',
});

FileAttachment.belongsTo(Booking, {
  foreignKey: 'bookingId',
  as: 'booking',
});

export default FileAttachment;
