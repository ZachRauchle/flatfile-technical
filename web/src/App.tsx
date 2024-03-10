import { useState, useEffect } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import React from 'react'

import Section from './components/section'
import { ISection } from './types/section'
import { ICard } from './types/card'

import './App.css'

export const BoardContainer = styled.div`
  background-color: #4d4d4d;
  color: #00ff00;
  font-family: 'Comic Neue'; 
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  overflow-y: hidden;
  overflow-x: auto;
  position: absolute;
  padding: 5px;
  align-items: flex-start;
`

function App() {
  const [sections, setSections] = useState<ISection[]>([])

  useEffect(() => {
    axios.get<ISection[]>('http://localhost:3001/sections')
      .then(response => {
        const sortedSections = response.data
          .sort((a: ISection, b: ISection) => a.id - b.id)
          .map((section: ISection) => ({
            ...section,
            cards: section.cards.sort((a: ICard, b: ICard) => a.position! - b.position!),
          }))
  
        setSections(sortedSections)
      })
      .catch(error => {
        console.error("Failed to fetch sections:", error)
      })
  }, []) //Prevent infinite requests

  const onCardSubmit = (ISectiond: number, title: string) => {
    console.log('Submitting card:', title, 'to section ID:', ISectiond)

    axios
      .post('http://localhost:3001/cards', { sectionId: ISectiond, title })
      .then((response) => {
        console.log('Card submitted successfully:', response.data)

        const newCard = {
          id: response.data.id,
          title: response.data.title,
          section_id: ISectiond
        }

        setSections((prevSections) => {
          return prevSections.map((section) => {
            if (section.id === ISectiond) {
              return {
                ...section,
                cards: [...section.cards, newCard]
              }
            }
            return section
          })
        })
      })
      .catch((error) => {
        console.error('Error adding card:', error)
      })
  }

  //On release of a drag action
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (
      !destination ||
      (source.droppableId === destination.droppableId && source.index === destination.index)
    ) {
      return
    }

    const sourceSectionIndex = sections.findIndex(
      (section) => section.id.toString() === source.droppableId
    )
    const destinationSectionIndex = sections.findIndex(
      (section) => section.id.toString() === destination.droppableId
    )
    const cardId = parseInt(draggableId)

    if (sourceSectionIndex === -1 || destinationSectionIndex === -1) return

    const sourceSection = sections[sourceSectionIndex]
    const destinationSection = sections[destinationSectionIndex]
    const movingCardIndex = sourceSection.cards.findIndex((card) => card.id === cardId)
    const movingCard = sourceSection.cards[movingCardIndex]

    if (!movingCard) return

    // Update positions for cards in the source section
    const updatedSourceCards = sourceSection.cards
      .filter((card) => card.id !== cardId)
      .map((card, index) => ({
        ...card,
        position: index < movingCardIndex ? card.position ?? 0 : (card.position ?? 0) - 1
      }))

    // Insert the moving card into the new position in the destination section
    let updatedDestinationCards = [...destinationSection.cards]
    if (sourceSection === destinationSection) {
      updatedDestinationCards = updatedSourceCards // If moving within the same section
    }
    updatedDestinationCards.splice(destination.index, 0, movingCard)
    updatedDestinationCards = updatedDestinationCards.map((card, index) => ({
      ...card,
      position: index
    }))

    // Update the sections with the new cards arrays
    const updatedSections = sections.map((section, index) => {
      if (index === sourceSectionIndex) return { ...section, cards: updatedSourceCards }
      if (index === destinationSectionIndex) return { ...section, cards: updatedDestinationCards }
      return section
    })
    //Update local state
    setSections(updatedSections)

    // Prepare data for the server update
    const cardUpdates = updatedDestinationCards.map((card) => ({
      id: card.id,
      sectionId: destinationSection.id,
      position: card.position
    }))

    // Update the server with the new card positions
    cardUpdates.forEach((cardUpdate) => {
      axios
        .patch(`http://localhost:3001/cards/${cardUpdate.id}`, {
          sectionId: cardUpdate.sectionId,
          position: cardUpdate.position
        })
        .then((response) => console.log(`Card ${cardUpdate.id} updated successfully`))
        .catch((error) => console.error('Error updating card:', error))
    })
  }
  //Handling next/previous button clicks
  const handleMoveCard = (cardId: number, newSectionId: number) => {
    setSections((prevSections) => {
      const cardToMove = prevSections
        .flatMap((section) => section.cards)
        .find((card) => card.id === cardId)
      if (!cardToMove) return prevSections

      return prevSections.map((section) => {
        if (section.cards.find((card) => card.id === cardId)) {
          // Remove the card from its current section
          return { ...section, cards: section.cards.filter((card) => card.id !== cardId) }
        } else if (section.id === newSectionId) {
          // Add the card to the new section
          return { ...section, cards: [...section.cards, cardToMove] }
        }
        return section
      })
    })

    axios
      .patch(`http://localhost:3001/cards/${cardId}`, {
        sectionId: newSectionId
      })
      .then((response) => console.log(`Card ${cardId} moved successfully`))
      .catch((error) => console.error('Error moving card:', error))
  }

  const handleMoveCardToNext = (cardId: number) => {
    const currentSectionIndex = sections.findIndex((section) =>
      section.cards.some((card) => card.id === cardId)
    )
    if (currentSectionIndex === -1) return

    const nextSectionIndex = (currentSectionIndex + 1) % sections.length
    const nextSection = sections[nextSectionIndex]
    handleMoveCard(cardId, nextSection.id)
  }

  const handleMoveCardToPrevious = (cardId: number) => {
    const currentSectionIndex = sections.findIndex((section) =>
      section.cards.some((card) => card.id === cardId)
    )
    if (currentSectionIndex === -1) return

    const previousSectionIndex = (currentSectionIndex - 1 + sections.length) % sections.length
    const previousSection = sections[previousSectionIndex]
    handleMoveCard(cardId, previousSection.id)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <BoardContainer>
        {sections.map((section, index) => (
          <Droppable droppableId={section.id.toString()} key={section.id}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <Section
                  section={section}
                  onCardSubmit={onCardSubmit}
                  onMoveCardToNext={handleMoveCardToNext}
                  onMoveCardToPrevious={handleMoveCardToPrevious}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </BoardContainer>
    </DragDropContext>
  )
}

export default App
