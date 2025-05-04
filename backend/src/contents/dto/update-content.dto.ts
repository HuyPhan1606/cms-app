import { PartialType } from '@nestjs/mapped-types';
import { CreateContentDto } from './content.dto';

export class UpdateContentDto extends PartialType(CreateContentDto) {}
