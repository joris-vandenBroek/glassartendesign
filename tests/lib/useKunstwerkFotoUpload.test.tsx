import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { useKunstwerkFotoUpload } from '@/lib/useKunstwerkFotoUpload';

const uploadBytesMock = vi.fn();
const getDownloadURLMock = vi.fn();

vi.mock('@/lib/firebase', () => ({ storage: {} }));

vi.mock('firebase/storage', () => ({
  ref: vi.fn((_storage, path) => ({ path })),
  uploadBytes: (...args: unknown[]) => uploadBytesMock(...args),
  getDownloadURL: (...args: unknown[]) => getDownloadURLMock(...args),
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
  uploadBytesMock.mockReset();
  getDownloadURLMock.mockReset();
});

describe('useKunstwerkFotoUpload', () => {
  it('uploads the file and resolves with the download URL', async () => {
    uploadBytesMock.mockResolvedValue(undefined);
    getDownloadURLMock.mockResolvedValue('https://storage.example.com/foto.jpg');
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile()] } });
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('https://storage.example.com/foto.jpg'));
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('uploads to a path under kunstwerken/ that includes the original filename', async () => {
    uploadBytesMock.mockResolvedValue(undefined);
    getDownloadURLMock.mockResolvedValue('https://storage.example.com/foto.jpg');
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile('mijn-kunstwerk.png')] } });
    await waitFor(() => expect(screen.getByTestId('url')).not.toHaveTextContent('none'));
    const [, pathArg] = uploadBytesMock.mock.calls[0][0].path ? [null, uploadBytesMock.mock.calls[0][0].path] : [];
    expect(pathArg).toMatch(/^kunstwerken\/.+mijn-kunstwerk\.png$/);
  });

  it('sets uploading to true while the upload is in flight, then false when done', async () => {
    let resolveUpload: (value: unknown) => void = () => {};
    uploadBytesMock.mockReturnValue(
      new Promise((resolve) => {
        resolveUpload = resolve;
      })
    );
    getDownloadURLMock.mockResolvedValue('https://storage.example.com/foto.jpg');
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile()] } });
    await waitFor(() => expect(screen.getByTestId('uploading')).toHaveTextContent('true'));
    resolveUpload(undefined);
    await waitFor(() => expect(screen.getByTestId('uploading')).toHaveTextContent('false'));
  });

  it('sets an error and resolves null when uploadBytes fails', async () => {
    uploadBytesMock.mockRejectedValue(new Error('offline'));
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile()] } });
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('upload'));
    expect(screen.getByTestId('url')).toHaveTextContent('none');
    expect(screen.getByTestId('uploading')).toHaveTextContent('false');
  });

  it('sets an error and resolves null when getDownloadURL fails', async () => {
    uploadBytesMock.mockResolvedValue(undefined);
    getDownloadURLMock.mockRejectedValue(new Error('offline'));
    render(<TestConsumer />);
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [makeFile()] } });
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('upload'));
    expect(screen.getByTestId('url')).toHaveTextContent('none');
  });
});
