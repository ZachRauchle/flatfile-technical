import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CardEntity } from '../entities/Card'
import { Repository } from 'typeorm'

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardEntity)
    private cardsRepository: Repository<CardEntity>
  ) {}

  create({ sectionId, title }: { sectionId: number; title: string }): Promise<CardEntity> {
    let card = new CardEntity()
    card.title = title
    card.section_id = sectionId
    return this.cardsRepository.save(card)
  }

async update(id: number, updateData: { sectionId: number; position?: number }): Promise<CardEntity> {
  const { sectionId, position } = updateData;

  const card = await this.cardsRepository.findOne(id);
  if (!card) {
    throw new NotFoundException(`Card with ID "${id}" not found`);
  }

  card.section_id = sectionId;
  if (position !== undefined) {
    card.position = position;
  }

  await this.cardsRepository.save(card);
  return card;
}

}
