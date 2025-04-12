import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsArray,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSurveyQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsIn(['text', 'multiple-choice', 'scale'])
  type: 'text' | 'multiple-choice' | 'scale';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  scaleMin?: number;

  @IsOptional()
  scaleMax?: number;

  @IsOptional()
  scaleStep?: number;

  @IsNotEmpty()
  order: number;
}

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
  status?: 'draft' | 'active' | 'archived';

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateSurveyQuestionDto)
  questions: CreateSurveyQuestionDto[];
}
