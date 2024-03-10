import React, { useState } from 'react'
import { Droppable } from 'react-beautiful-dnd'

import Card from '../card'
import { ISection } from '../../types/section'

import {
  AddCardButtonDiv,
  AddCardButtonSpan,
  CardComposerDiv,
  CardsContainer,
  ListCardComponent,
  ListCardDetails,
  ListCardTextArea,
  SectionHeader,
  SectionTitle,
  SubmitCardButton,
  SubmitCardButtonDiv,
  WrappedSection,
  Wrapper
} from './styled-components'
import { ICard } from '../../types/card'

const Section = ({
  section: { id, title, cards },
  onCardSubmit,
  onMoveCardToNext,
  onMoveCardToPrevious
}: {
  section: ISection
  onCardSubmit: (sectionId: number, title: string) => void
  onMoveCardToNext: (cardId: number) => void
  onMoveCardToPrevious: (cardId: number) => void
}) => {
  const [isTempCardActive, setIsTempCardActive] = useState(false)
  const [cardText, setCardText] = useState('')

  return (
    <Wrapper>
      <WrappedSection>
        <SectionHeader>
          <SectionTitle>{title}</SectionTitle>
        </SectionHeader>
        <CardsContainer>
          <Droppable droppableId={id.toString()}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {cards.length > 0 &&
                  cards.map((card: ICard, index: number) => (
                    <Card
                      key={card.id}
                      card={card}
                      index={index}
                      onMoveCardToNext={onMoveCardToNext}
                      onMoveCardToPrevious={onMoveCardToPrevious}
                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </CardsContainer>
        {isTempCardActive ? (
          <CardComposerDiv>
            <ListCardComponent>
              <ListCardDetails>
                <ListCardTextArea
                  placeholder='Enter a title for the new card'
                  onChange={(e) => setCardText(e.target.value)}
                />
              </ListCardDetails>
            </ListCardComponent>
            <SubmitCardButtonDiv>
              <SubmitCardButton
                type='button'
                value='Add card'
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.preventDefault()

                  if (cardText) {
                    onCardSubmit(id, cardText)
                    setCardText('')
                  }

                  setIsTempCardActive(false)
                }}
              />
            </SubmitCardButtonDiv>
          </CardComposerDiv>
        ) : (
          <AddCardButtonDiv onClick={() => setIsTempCardActive(true)}>
            <AddCardButtonSpan>Add another card</AddCardButtonSpan>
          </AddCardButtonDiv>
        )}
      </WrappedSection>
    </Wrapper>
  )
}

export default Section
