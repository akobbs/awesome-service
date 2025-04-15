import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SurveyStatus } from '../entities/survey.entity';

class FilterDto {
  @IsOptional()
  status?: SurveyStatus;

  // Add more filters here in future
}

export class CursorPaginateSurveysDto {
  @IsOptional()
  @IsString()
  after?: string;

  @IsOptional()
  @IsString()
  before?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  first?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  last?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FilterDto)
  filter?: FilterDto;
}
