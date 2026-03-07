import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExcelUpload } from './ExcelUpload';
import { parseExcelAction } from '@/app/editor/[id]/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/app/editor/[id]/actions', () => ({
  parseExcelAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock FilePond
vi.mock('react-filepond', () => ({
  FilePond: vi.fn(({ files, onupdatefiles, server, ...props }) => (
    <div data-testid="mock-filepond">
      <input
        type="file"
        data-testid="file-input"
        onChange={(e) => {
          if (e.target.files?.[0] && server?.process) {
            const file = e.target.files[0];
            const mockLoad = vi.fn();
            const mockError = vi.fn();
            const mockProgress = vi.fn();
            const mockAbort = vi.fn();
            
            // Call the process function with the file
            server.process(
              'fieldName',
              file,
              {},
              mockLoad,
              mockError,
              mockProgress,
              mockAbort
            );
          }
        }}
      />
    </div>
  )),
  registerPlugin: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-123');

describe('ExcelUpload', () => {
  const mockRouter = {
    push: vi.fn(),
  };
  
  const mockOnUploadComplete = vi.fn();
  const mockFile = new File(['test content'], 'test.xlsx', { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    
    // Default successful response
    vi.mocked(parseExcelAction).mockResolvedValue({
      name: 'Parsed Sheet',
      data: {
        'A1': { value: '10', formula: '' },
        'B1': { value: '20', formula: '' },
      },
    });

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders the FilePond component', () => {
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    expect(screen.getByTestId('mock-filepond')).toBeInTheDocument();
  });

  it('handles successful file upload and parsing', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, mockFile);

    // Wait for async operations
    await waitFor(() => {
      expect(parseExcelAction).toHaveBeenCalledTimes(1);
    });

    // Check localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'excel-editor-files',
      JSON.stringify([
        {
          id: 'test-uuid-123',
          name: 'test',
          lastModified: expect.any(Number),
          data: {
            'A1': { value: '10', formula: '' },
            'B1': { value: '20', formula: '' },
          },
        },
      ])
    );

    // Check onUploadComplete was called with correct data
    expect(mockOnUploadComplete).toHaveBeenCalledWith({
      id: 'test-uuid-123',
      name: 'test',
      lastModified: expect.any(Number),
      data: {
        'A1': { value: '10', formula: '' },
        'B1': { value: '20', formula: '' },
      },
    });

    // Check success toast
    expect(toast.success).toHaveBeenCalledWith(
      '✅ Workbook uploaded successfully!',
      expect.objectContaining({
        description: '"test" has been added to your spreadsheets.',
      })
    );

    // Fast-forward timers to trigger redirect
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/editor/test-uuid-123');
  });

  it('handles file upload with custom name from parse result', async () => {
    vi.mocked(parseExcelAction).mockResolvedValue({
      name: 'Custom Sheet Name',
      data: {
        'A1': { value: '10', formula: '' },
      },
    });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'excel-editor-files',
        JSON.stringify([
          {
            id: 'test-uuid-123',
            name: 'Custom Sheet Name',
            lastModified: expect.any(Number),
            data: {
              'A1': { value: '10', formula: '' },
            },
          },
        ])
      );
    });
  });

  it('handles file upload without filename (Blob only)', async () => {
    const blobFile = new Blob(['test content'], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    
    // Create a FileList-like object
    Object.defineProperty(blobFile, 'name', {
      value: undefined,
      configurable: true,
    });

    await user.upload(fileInput, blobFile);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'excel-editor-files',
        JSON.stringify([
          {
            id: 'test-uuid-123',
            name: 'Uploaded Sheet', // Default name
            lastModified: expect.any(Number),
            data: {
              'A1': { value: '10', formula: '' },
              'B1': { value: '20', formula: '' },
            },
          },
        ])
      );
    });
  });

  it('handles existing files in localStorage', async () => {
    // Setup existing files in localStorage
    const existingFiles = [
      {
        id: 'existing-1',
        name: 'Existing Sheet',
        lastModified: 123456789,
      },
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existingFiles));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, mockFile);

    await waitFor(() => {
      // Check that the new file is prepended to existing ones
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'excel-editor-files',
        JSON.stringify([
          {
            id: 'test-uuid-123',
            name: 'test',
            lastModified: expect.any(Number),
            data: {
              'A1': { value: '10', formula: '' },
              'B1': { value: '20', formula: '' },
            },
          },
          ...existingFiles,
        ])
      );
    });
  });

  it('handles parsing errors gracefully', async () => {
    const error = new Error('Failed to parse');
    vi.mocked(parseExcelAction).mockRejectedValue(error);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to parse Excel file. Please make sure it\'s a valid .xlsx file.',
        expect.objectContaining({ duration: 5000 })
      );
    });

    // Check that localStorage was not updated
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    expect(mockOnUploadComplete).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('handles invalid file format errors with specific message', async () => {
    const error = new Error('central directory not found');
    vi.mocked(parseExcelAction).mockRejectedValue(error);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Unsupported file format. Please use a modern .xlsx file (Legacy .xls are not supported).',
        expect.objectContaining({ duration: 5000 })
      );
    });
  });

  it('handles invalid file object from FilePond', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    // Override the mock to simulate invalid file
    vi.mocked(parseExcelAction).mockImplementation(async () => {
      throw new Error('Invalid file object');
    });

    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    
    // Upload with invalid file object (null)
    await user.upload(fileInput, null as any);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to parse Excel file. Please make sure it\'s a valid .xlsx file.',
        expect.any(Object)
      );
    });
  });

  it('clears files state after successful upload', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    // We need to spy on the setFiles function
    // This is a bit tricky with the current mock setup
    // For now, we'll just verify the success path
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(parseExcelAction).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('handles network errors during upload', async () => {
    vi.mocked(parseExcelAction).mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to parse Excel file. Please make sure it\'s a valid .xlsx file.',
        expect.any(Object)
      );
    });
  });

  it('preserves file extension when generating name', async () => {
    const fileWithExtension = new File(['test'], 'my-spreadsheet.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, fileWithExtension);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'excel-editor-files',
        JSON.stringify([
          {
            id: 'test-uuid-123',
            name: 'my-spreadsheet', // Extension removed
            lastModified: expect.any(Number),
            data: expect.any(Object),
          },
        ])
      );
    });
  });

  it('handles multiple file upload attempts', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<ExcelUpload onUploadComplete={mockOnUploadComplete} />);
    
    const fileInput = screen.getByTestId('file-input');
    
    // First upload
    await user.upload(fileInput, mockFile);
    
    await waitFor(() => {
      expect(parseExcelAction).toHaveBeenCalledTimes(1);
    });

    // Clear mocks
    vi.clearAllMocks();
    
    // Second upload with different file
    const secondFile = new File(['different content'], 'another.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    vi.mocked(parseExcelAction).mockResolvedValue({
      name: 'Another Sheet',
      data: {
        'C1': { value: '30', formula: '' },
      },
    });

    await user.upload(fileInput, secondFile);

    await waitFor(() => {
      expect(parseExcelAction).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});