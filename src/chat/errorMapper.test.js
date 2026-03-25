import { mapBackendErrorToChatMessage } from './errorMapper';

describe('mapBackendErrorToChatMessage', () => {
  test('uses backend ErrorResponse message when available', () => {
    const error = {
      response: {
        status: 404,
        data: {
          status: 404,
          message: 'Store not found for code STORE999',
        },
      },
    };

    const result = mapBackendErrorToChatMessage(error);
    expect(result).toBe('Request failed (404): Store not found for code STORE999');
  });

  test('falls back to mapped status help when backend payload missing', () => {
    const error = {
      response: {
        status: 500,
      },
    };

    const result = mapBackendErrorToChatMessage(error);
    expect(result).toContain('500');
  });

  test('uses provided fallback when status is unknown', () => {
    const result = mapBackendErrorToChatMessage({}, 'Custom fallback');
    expect(result).toBe('Custom fallback');
  });

  test('returns friendly default when no fallback is provided', () => {
    const result = mapBackendErrorToChatMessage({});
    expect(result.toLowerCase()).toContain('something went wrong');
  });
});
