import React from 'react';
import { render } from '@testing-library/react-native';
import { IdeaverseLogo, IdeaVerseLogoSmall } from '../../src/components/IdeaverseLogo';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Svg      = ({ children, ...p }: any) => <View testID="svg" {...p}>{children}</View>;
  const Circle   = (p: any) => <View testID="circle" {...p} />;
  const Path     = (p: any) => <View testID="path" {...p} />;
  const Defs     = ({ children }: any) => <>{children}</>;
  const G        = ({ children }: any) => <>{children}</>;
  const LinearGradient  = ({ children }: any) => <>{children}</>;
  const RadialGradient  = ({ children }: any) => <>{children}</>;
  const Stop            = () => null;
  const Animated = { createAnimatedComponent: (C: any) => C };
  return { default: Svg, Circle, Path, Defs, G, LinearGradient, RadialGradient, Stop, Animated };
});

describe('IdeaverseLogo', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<IdeaverseLogo />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with default size 80', () => {
    const { getByTestId } = render(<IdeaverseLogo />);
    const svg = getByTestId('svg');
    expect(svg.props.width).toBe(80);
    expect(svg.props.height).toBe(80);
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(<IdeaverseLogo size={120} />);
    const svg = getByTestId('svg');
    expect(svg.props.width).toBe(120);
    expect(svg.props.height).toBe(120);
  });

  it('renders with animate prop without crashing', () => {
    const { toJSON } = render(<IdeaverseLogo size={80} animate />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders multiple circle elements', () => {
    const { getAllByTestId } = render(<IdeaverseLogo />);
    const circles = getAllByTestId('circle');
    expect(circles.length).toBeGreaterThan(3);
  });

  it('renders path elements for the letter I', () => {
    const { getAllByTestId } = render(<IdeaverseLogo />);
    const paths = getAllByTestId('path');
    expect(paths.length).toBeGreaterThan(0);
  });
});

describe('IdeaVerseLogoSmall', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<IdeaVerseLogoSmall />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with default size 32', () => {
    const { getByTestId } = render(<IdeaVerseLogoSmall />);
    const svg = getByTestId('svg');
    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(<IdeaVerseLogoSmall size={48} />);
    const svg = getByTestId('svg');
    expect(svg.props.width).toBe(48);
    expect(svg.props.height).toBe(48);
  });
});
