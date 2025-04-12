import { IsInt, IsOptional, IsString, IsEnum, Min } from 'class-validator';

export class UpdateSurveyQuestionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsEnum(['text', 'scale'])
  type?: 'text' | 'scale';

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @IsOptional()
  @IsInt()
  scaleMin?: number;

  @IsOptional()
  @IsInt()
  scaleMax?: number;
}
