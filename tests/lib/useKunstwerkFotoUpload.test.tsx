import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { useKunstwerkFotoUpload } from '@/lib/useKunstwerkFotoUpload';

const getIdTokenMock = vi.fn();

vi.mock('@/lib/firebase', () => ({
  auth: {
    get currentUser() {
      return { getIdToken: getIdTokenMock };
    },
  },
}));

function TestConsumer() {
  const { uploading, error, upload } = useKunstwerkFotoUpload();
  const [url, setUrl] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const result = await upload(file);
      setUrl(result);
    }
  }

  return (
    <div>
      <input type="file" data-testid="file-input" onChange={handleChange} />
      <div data-testid="uploading">{String(uploading)}</div>
      <div data-testid="error">{error ?? 'none'}</div>
      <div data-testid="url">{url ?? 'none'}</div>
    </div>
  );
}

function makeFile(name = 'foto.jpg') {
  return new File(['inhoud'], name, { type: 'image/jpeg' });
}

beforeEach(() => {
  getIdTokenMock.mockReset();
  getIdTokenMock.mockResolvedValue('id-token-123');
  vi.stubEnv('NEXT_PUBLIC_UPLOAD_ENDPOINT_URL', 'https://mail-server.example.com/upload-kunstwerk-foto.php');
  vi.stubGlobal('fetch', vi.fn());
});

describe('useKunstwerkFotoUpload', () => {
  it('uploads the file and resolves with the download URL', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, url: 'https://storage.example.com/foto.jpg' }),
    });
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile()] } });
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('https://storage.example.com/foto.jpg'));
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('sends the Firebase idToken and the file as form data to the configured endpoint', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, url: 'https://storage.example.com/foto.jpg' }),
    });
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile('mijn-kunstwerk.png')] } });
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [endpoint, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(endpoint).toBe('https://mail-server.example.com/upload-kunstwerk-foto.php');
    expect(options.method).toBe('POST');
    const body = options.body as FormData;
    expect(body.get('idToken')).toBe('id-token-123');
    expect((body.get('foto') as File).name).toBe('mijn-kunstwerk.png');
  });

  it('sets uploading to true while the upload is in flight, then false when done', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile()] } });
    await waitFor(() => expect(screen.getByTestId('uploading')).toHaveTextContent('true'));
    resolveFetch({ ok: true, json: async () => ({ success: true, url: 'https://storage.example.com/foto.jpg' }) });
    await waitFor(() => expect(screen.getByTestId('uploading')).toHaveTextContent('false'));
  });

  it('sets an error and resolves null when the endpoint responds with an error', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: 'Forbidden' }),
    });
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile()] } });
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('upload'));
    expect(screen.getByTestId('url')).toHaveTextContent('none');
    expect(screen.getByTestId('uploading')).toHaveTextContent('false');
  });

  it('sets an error and resolves null when fetch throws', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('offline'));
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile()] } });
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('upload'));
    expect(screen.getByTestId('url')).toHaveTextContent('none');
  });

  it('sets an error and does not call fetch when the endpoint env var is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_UPLOAD_ENDPOINT_URL', '');
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile()] } });
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('upload'));
    expect(fetch).not.toHaveBeenCalled();
  });
});
