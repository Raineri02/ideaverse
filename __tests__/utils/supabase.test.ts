// Unmock supabase to test the real decode/uploadImage helpers
jest.unmock('../../src/lib/supabase');
const { uploadImage, decode } = require('../../src/lib/supabase');
const { supabase } = require('../../src/lib/supabase');

describe('decode utility', () => {
  it('decodes base64 string to Uint8Array', () => {
    // "hello" in base64 is "aGVsbG8="
    const result = decode('aGVsbG8=');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it('produces correct byte values', () => {
    // "A" in base64 is "QQ=="
    const result = decode('QQ==');
    expect(result[0]).toBe(65); // ASCII for 'A'
  });
});

describe('uploadImage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns public URL on success', async () => {
    const url = await uploadImage('base64data', 'covers/test.jpg');
    expect(url).toBe('https://example.com/test.jpg');
  });

  it('returns null when upload fails', async () => {
    (supabase.storage.from as jest.Mock).mockReturnValueOnce({
      upload: jest.fn().mockResolvedValue({ data: null, error: { message: 'Upload failed' } }),
      getPublicUrl: jest.fn(),
    });

    const url = await uploadImage('base64data', 'covers/fail.jpg');
    expect(url).toBeNull();
  });

  it('calls upload with correct path', async () => {
    const uploadMock = jest.fn().mockResolvedValue({ data: { path: 'covers/myfile.jpg' }, error: null });
    (supabase.storage.from as jest.Mock).mockReturnValueOnce({
      upload: uploadMock,
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/covers/myfile.jpg' } })),
    });

    await uploadImage('base64data', 'covers/myfile.jpg');
    expect(uploadMock).toHaveBeenCalledWith(
      'covers/myfile.jpg',
      expect.any(Uint8Array),
      expect.objectContaining({ contentType: 'image/jpeg', upsert: true })
    );
  });
});
