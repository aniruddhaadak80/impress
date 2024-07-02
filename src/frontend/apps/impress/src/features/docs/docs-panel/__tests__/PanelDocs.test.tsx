import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import { AppWrapper } from '@/tests/utils';

import { DocList } from '../components/DocList';
import { Panel } from '../components/Panel';

window.HTMLElement.prototype.scroll = function () {};

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: () => ({
    query: {},
  }),
}));

describe('PanelDocs', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('renders with no doc to display', async () => {
    fetchMock.mock(`end:/documents/?page=1&ordering=-created_at`, {
      count: 0,
      results: [],
    });

    render(<DocList />, { wrapper: AppWrapper });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(
      await screen.findByText(
        'Create your first document by clicking on the "Create a new document" button.',
      ),
    ).toBeInTheDocument();
  });

  it('renders an empty doc', async () => {
    fetchMock.mock(`end:/documents/?page=1&ordering=-created_at`, {
      count: 1,
      results: [
        {
          id: '1',
          name: 'Team 1',
          accesses: [],
        },
      ],
    });

    render(<DocList />, { wrapper: AppWrapper });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(await screen.findByLabelText('Empty docs icon')).toBeInTheDocument();
  });

  it('renders a doc with only 1 member', async () => {
    fetchMock.mock(`end:/documents/?page=1&ordering=-created_at`, {
      count: 1,
      results: [
        {
          id: '1',
          name: 'Team 1',
          accesses: [
            {
              id: '1',
              role: 'owner',
            },
          ],
        },
      ],
    });

    render(<DocList />, { wrapper: AppWrapper });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(await screen.findByLabelText('Empty docs icon')).toBeInTheDocument();
  });

  it('renders a non-empty doc', async () => {
    fetchMock.mock(`end:/documents/?page=1&ordering=-created_at`, {
      count: 1,
      results: [
        {
          id: '1',
          name: 'Doc 1',
          accesses: [
            {
              id: '1',
              role: 'admin',
            },
            {
              id: '2',
              role: 'member',
            },
          ],
        },
      ],
    });

    render(<DocList />, { wrapper: AppWrapper });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(await screen.findByLabelText('Docs icon')).toBeInTheDocument();
  });

  it('renders the error', async () => {
    fetchMock.mock(`end:/documents/?page=1&ordering=-created_at`, {
      status: 500,
    });

    render(<DocList />, { wrapper: AppWrapper });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(
      await screen.findByText('Something bad happens, please retry.'),
    ).toBeInTheDocument();
  });

  it('renders with doc panel open', async () => {
    fetchMock.mock(`end:/documents/?page=1&ordering=-created_at`, {
      count: 1,
      results: [],
    });

    render(<Panel />, { wrapper: AppWrapper });

    expect(
      screen.getByRole('button', { name: 'Close the documents panel' }),
    ).toBeVisible();

    expect(await screen.findByText('Documents')).toBeVisible();
  });

  it('closes and opens the doc panel', async () => {
    fetchMock.mock(`end:/documents/?page=1&ordering=-created_at`, {
      count: 1,
      results: [],
    });

    render(<Panel />, { wrapper: AppWrapper });

    expect(await screen.findByText('Documents')).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Close the documents panel',
      }),
    );

    expect(await screen.findByText('Documents')).not.toBeVisible();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Open the documents panel',
      }),
    );

    expect(await screen.findByText('Documents')).toBeVisible();
  });
});