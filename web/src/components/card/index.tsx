import styled from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'
import React from 'react'

const CardContainer = styled.div`
  border-radius: 3px;
  border-bottom: 1px solid #ccc;
  background-color: #fff;
  position: relative;
  padding: 10px;
  cursor: pointer;
  max-width: 250px;
  margin-bottom: 7px;
  min-width: 230px;
`

const CardTitle = styled.div``

const MoveButton = styled.button`
  margin-top: 5px;
`

// Props for move function
const Card = ({
  card,
  index,
  onMoveCardToNext,
  onMoveCardToPrevious
}: {
  card: { id: number; title: string }
  index: number
  onMoveCardToNext: (cardId: number) => void
  onMoveCardToPrevious: (cardId: number) => void
}) => (
  <Draggable draggableId={card.id.toString()} index={index}>
    {(provided, snapshot) => (
      <CardContainer
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className='card'
      >
        <CardTitle>{card.title}</CardTitle>
        <div>
          <MoveButton onClick={() => onMoveCardToPrevious(card.id)}>Move to Previous</MoveButton>
          <MoveButton onClick={() => onMoveCardToNext(card.id)}>Move to Next</MoveButton>
        </div>
      </CardContainer>
    )}
  </Draggable>
)

export default Card
