import { Body, Controller, Logger, Post, Patch, Param } from '@nestjs/common'
import { CardEntity } from '../entities/Card'
import { CardsService } from './cards.service'

@Controller('cards')
export class CardsController {
  private readonly logger = new Logger(CardsController.name)

  constructor(private cardsService: CardsService) {}

  @Post()
  addCard(@Body() card: { sectionId: number; title: string }): Promise<CardEntity> {
    this.logger.log('POST /cards')

    return this.cardsService.create(card)
  }

  @Patch(':id')
  updateCard(@Param('id') id: number, @Body() updateData: { sectionId: number; position?: number }): Promise<CardEntity> {
    this.logger.log(`PATCH /cards/${id}`);
    return this.cardsService.update(id, updateData);

  }
}
