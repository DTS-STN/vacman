import { createRoutesStub } from 'react-router';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DatePickerField } from '~/components/date-picker-field';

describe('DatePickerField', () => {
  it('should render date picker field component', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <DatePickerField
            id="id"
            legend="legend date picker field test"
            names={{
              year: 'yearTest',
              month: 'monthTest',
              day: 'dayTest',
            }}
          />
        ),
      },
    ]);

    const { container } = render(<RoutesStub />);

    expect(container).toMatchSnapshot('expected html');
  });

  it('should render date picker field component with required', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <DatePickerField
            id="id"
            legend="legend date picker field test"
            names={{
              year: 'yearTest',
              month: 'monthTest',
              day: 'dayTest',
            }}
            required
          />
        ),
      },
    ]);

    const { container } = render(<RoutesStub />);

    expect(container).toMatchSnapshot('expected html');
  });

  it('should render date picker field component with help message primary and help message secondary', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <DatePickerField
            helpMessagePrimary="help message primary"
            helpMessageSecondary="help message secondary"
            id="id"
            legend="legend date picker field test"
            names={{
              year: 'yearTest',
              month: 'monthTest',
              day: 'dayTest',
            }}
          />
        ),
      },
    ]);

    const { container } = render(<RoutesStub />);

    expect(container).toMatchSnapshot('expected html');
  });

  it('should render date picker field component with default value as string', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <DatePickerField
            defaultValue={'2025-01-01'}
            id="id"
            legend="legend date picker field test"
            names={{
              year: 'yearTest',
              month: 'monthTest',
              day: 'dayTest',
            }}
          />
        ),
      },
    ]);

    const { container } = render(<RoutesStub />);

    expect(container).toMatchSnapshot('expected html');
  });

  it('should render date picker field component with default value as object', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <DatePickerField
            defaultValue={{
              year: '2025',
              month: '01',
              day: '31',
            }}
            id="id"
            legend="legend date picker field test"
            names={{
              year: 'yearTest',
              month: 'monthTest',
              day: 'dayTest',
            }}
          />
        ),
      },
    ]);

    const { container } = render(<RoutesStub />);

    expect(container).toMatchSnapshot('expected html');
  });

  it('should render date picker field component with error message', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <DatePickerField
            id="id"
            legend="legend date picker field test"
            names={{
              year: 'yearTest',
              month: 'monthTest',
              day: 'dayTest',
            }}
            errorMessages={{
              all: 'test error all',
              day: 'test error day',
              month: 'test error month',
              year: 'test error year',
            }}
          />
        ),
      },
    ]);

    const { container } = render(<RoutesStub />);

    expect(container).toMatchSnapshot('expected html');
  });
});
