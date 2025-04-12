import {
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { PaginateSurveysQueryDto } from './dto/paginate-surveys.dto';
import { SurveyService } from './survey.service';
import { assertFound, unwrapResultOrThrow } from '../common/utils';
import { UpdateSurveyDto } from './dto/update-survey.dto';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  async create(@Body() dto: CreateSurveyDto) {
    return this.surveyService.createSurvey(dto);
  }

  @Get()
  async findAll(@Query() query: PaginateSurveysQueryDto) {
    debugger;
    return this.surveyService.getPaginatedSurveys(query);
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const survey = await this.surveyService.getSurveyByUuid(uuid);
    return assertFound(survey, `Survey with UUID ${uuid} not found`);
  }

  @Patch(':uuid')
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateSurveyDto) {
    const result = await this.surveyService.updateSurvey(uuid, dto);

    return unwrapResultOrThrow(result, {
      SurveyNotFoundError: () =>
        new NotFoundException(`Survey with UUID ${uuid} not found`),
      SurveyVersionMismatchError: () =>
        new ConflictException(
          'Survey has been updated by someone else. Please reload and try again.',
        ),
      UnknownError: () => new InternalServerErrorException(),
    });
  }
}
