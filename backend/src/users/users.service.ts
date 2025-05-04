import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Create user
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  // Get all users
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Find user to check exists
  async findUser(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Find user to check exists
  async findById(id: Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const _id = new Types.ObjectId(id);
    const updateData = {
      ...updateUserDto,
      updatedAt: new Date(),
      updatedBy: _id,
    };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(_id, { $set: updateData }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async deleteUser(id: string) {
    const _id = new Types.ObjectId(id);
    if (_id) {
      await this.userModel.deleteOne({ _id });

      return {
        message: `User with Id: ${id} is deleted`,
      };
    }

    return {
      message: `User not found`,
    };
  }
}
