import { IsEnum } from 'class-validator';
import { SurveyStatus } from '../entities/survey.entity';

export class ChangeSurveyStatusDto {
  @IsEnum(['draft', 'active', 'archived'])
  status: SurveyStatus;
}
