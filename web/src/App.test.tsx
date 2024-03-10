import React from 'react'
import axios from 'axios'
import { render, cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('<App />', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Backlog',
          cards: [
            {
              id: 1,
              title: 'Test 1',
              section_id: 1
            }
          ]
        },
        {
          id: 2,
          title: 'Ready for Development',
          cards: []
        }
      ]
    })
  })

  afterEach(cleanup)

  it('matches snapshot', async () => {
    const { asFragment } = render(<App />)

    await screen.findByText('Backlog')

    expect(asFragment).toMatchSnapshot()
  })

  it('renders sections successfully', async () => {
    render(<App />)

    const backlogText = await screen.findByText('Backlog')
    const readyForDevelopmentText = await screen.findByText('Ready for Development')

  

  it('adds new card when submitted', async () => {
    render(<App />)
    userEvent.type(screen.getByPlaceholderText('Enter card title...'), 'New card')
    userEvent.click(screen.getByText('Add card'))

    await waitFor(() => {
      expect(screen.getByText('New card')).toBeInTheDocument()
    })

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        title: 'New card',
        sectionId: expect.any(Number)
      })
    )
  })

  it('moves card to next section when button clicked', async () => {
    // Mocked initial state with at least two sections and a card in the first section.
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: 1, title: 'Backlog', cards: [{ id: 1, title: 'Card 1', section_id: 1 }] },
        { id: 2, title: 'In Progress', cards: [] }
      ]
    })

    render(<App />)

    // Ensure the app has finished loading the sections and cards
    await screen.findByText('Card 1')
    const moveToNextButton = await screen.findByTestId('move-next-1') // Update based on your actual test ID or selector
    userEvent.click(moveToNextButton)

    await waitFor(() => {
      expect(screen.getByTestId('section-2-cards')).toContainElement(screen.getByText('Card 1'))
    })

    // Verify the correct Axios patch call
    expect(mockedAxios.patch).toHaveBeenCalledWith('http://localhost:3001/cards/1', {
      sectionId: 2
    })
  })
  it('handles drag and drop of a card to a new section', async () => {
    // Set up initial state with two sections and a card in the first section
    mockedAxios.get.mockResolvedValue({
      data: [
        { id: 1, title: 'Backlog', cards: [{ id: 1, title: 'Card 1', section_id: 1 }] },
        { id: 2, title: 'In Progress', cards: [] }
      ]
    })

    render(<App />)

    // Simulate the results of drag and drop operation
    const resultMock = {
      draggableId: '1',
      source: { droppableId: '1', index: 0 },
      destination: { droppableId: '2', index: 0 }
    }
  })
})
})
