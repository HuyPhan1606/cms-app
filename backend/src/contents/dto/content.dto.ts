import { IsString, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DataBlock {
  @IsString()
  tag: string;

  @IsString()
  data: string;
}
export class ContentBlock {
  @IsString()
  type: string;

  @IsObject()
  data: DataBlock;
}

export class CreateContentDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlock)
  blocks: ContentBlock[];

  @IsString()
  createdBy: string;

  @IsString()
  updatedBy: string;
}
