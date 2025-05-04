// src/contents/contents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from '../contents/content.schema';
import { CreateContentDto } from './dto/content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentGateway } from 'src/content.gateway';

@Injectable()
export class ContentsService {
  constructor(
    @InjectModel(Content.name)
    private contentModel: Model<ContentDocument>,
    private readonly contentGateway: ContentGateway,
  ) {}

  async create(createContentDto: CreateContentDto) {
    const content = new this.contentModel({
      ...createContentDto,
      createdBy: createContentDto.createdBy,
      updatedBy: createContentDto.updatedBy,
    });

    const savedContent = await content.save();

    this.contentGateway.server.emit('contentCreated', savedContent);

    return savedContent;
  }

  async findAll(): Promise<Content[]> {
    return this.contentModel.find().exec();
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentModel.findById(id).exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async update(id: string, updateContentDto: UpdateContentDto) {
    const content = await this.contentModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...updateContentDto,
            updatedAt: new Date(),
          },
        },
        { new: true },
      )
      .exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    this.contentGateway.server.emit('contentUpdated', content);
    return content;
  }

  async remove(id: string) {
    const content = await this.contentModel.findByIdAndDelete(id).exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    this.contentGateway.server.emit('contentDeleted', content);
    return content;
  }
}
