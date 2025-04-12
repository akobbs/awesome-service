import {
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSurveyQuestionDto } from './update-survey-question.dto';

export class UpdateSurveyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSurveyQuestionDto)
  questions?: UpdateSurveyQuestionDto[];

  @IsInt()
  @Min(0)
  version: number;
}
