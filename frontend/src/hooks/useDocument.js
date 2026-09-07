import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadPdf, getDocumentStatus } from '../services/api.js';
import { validateFile } from '../utils/formatters.js';

const POLL_INTERVAL_MS = 700;

/**
 * Owns everything about the currently uploaded PDF: the selected file,
 * upload progress, processing status, and polling.
 */
export function useDocument() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [documentStatus, setDocumentStatus] = useState('idle'); // idle | uploading | processing | ready | failed
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [documentMeta, setDocumentMeta] = useState(null);
  const [error, setError] = useState(null);

  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const pollStatus = useCallback(
    (docId) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const data = await getDocumentStatus(docId);
          setProcessingStep(data.stepIndex ?? 0);
          setDocumentMeta((prev) => ({ ...prev, pages: data.pages ?? prev?.pages, size: data.size ?? prev?.size }));

          if (data.status === 'ready') {
            setDocumentStatus('ready');
            stopPolling();
          } else if (data.status === 'failed') {
            setDocumentStatus('failed');
            setError("We couldn't process this document. Please try uploading it again.");
            stopPolling();
          }
        } catch {
          setDocumentStatus('failed');
          setError("We couldn't process this document. Please try uploading it again.");
          stopPolling();
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  const upload = useCallback(
    async (file) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setSelectedFile(file);
      setDocumentStatus('uploading');
      setUploadProgress(0);
      setDocumentMeta({ size: file.size, pages: null });

      try {
        const result = await uploadPdf(file, setUploadProgress);
        setDocumentId(result.documentId);
        setDocumentMeta((prev) => ({ ...prev, filename: result.filename || file.name }));
        setDocumentStatus('processing');
        setProcessingStep(0);
        pollStatus(result.documentId);
      } catch (err) {
        setDocumentStatus('failed');
        setError(err?.message || 'Upload failed. Please try again.');
      }
    },
    [pollStatus]
  );

  const retry = useCallback(() => {
    if (selectedFile) upload(selectedFile);
  }, [selectedFile, upload]);

  const remove = useCallback(() => {
    stopPolling();
    setSelectedFile(null);
    setDocumentId(null);
    setDocumentStatus('idle');
    setUploadProgress(0);
    setProcessingStep(0);
    setDocumentMeta(null);
    setError(null);
  }, [stopPolling]);

  return {
    selectedFile,
    documentId,
    documentStatus,
    uploadProgress,
    processingStep,
    documentMeta,
    error,
    upload,
    retry,
    remove,
    clearError: () => setError(null)
  };
}
