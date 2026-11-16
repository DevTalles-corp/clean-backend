import { describe, expect, test } from 'vitest';
import { isHttpUrl } from '../../../../src/shared/domain/validators/url.ts';

describe('isHttpUrl', () => {
  test.each([
    'http://example.com/a.png',
    'https://cdn.example.com/img/producto.jpg?w=200',
  ])('acepta la URL %j', (value) => {
    expect(isHttpUrl(value)).toBe(true);
  });

  test.each([
    '',
    'abc',
    '/relativa/imagen.png',
    'ftp://example.com/a.png',
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
  ])('rechaza el valor %j', (value) => {
    expect(isHttpUrl(value)).toBe(false);
  });
});
