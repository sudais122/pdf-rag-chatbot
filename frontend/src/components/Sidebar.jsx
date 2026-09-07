import PdfUpload from './PdfUpload.jsx';
import PdfCard from './PdfCard.jsx';
import ProcessingStatus from './ProcessingStatus.jsx';
import ErrorMessage from './ErrorMessage.jsx';

export default function Sidebar({
  isOpen,
  documentStatus,
  documentMeta,
  processingStep,
  error,
  onFileSelected,
  onRetry,
  onRemoveRequest
}) {
  const hasDocument = documentStatus !== 'idle';

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" />}
      <aside className={`sidebar${isOpen ? ' is-open' : ''}`} aria-label="Document panel">
        <div>
          <div className="sidebar-section-label">Document</div>

          {!hasDocument && <PdfUpload onFileSelected={onFileSelected} error={error} />}

          {documentStatus === 'uploading' && documentMeta && (
            <PdfCard filename={documentMeta.filename || 'Uploading…'} size={documentMeta.size} status="uploading" onRemove={onRemoveRequest} />
          )}

          {documentStatus === 'processing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <PdfCard
                filename={documentMeta?.filename}
                size={documentMeta?.size}
                status="processing"
                onRemove={onRemoveRequest}
              />
              <ProcessingStatus stepIndex={processingStep} />
            </div>
          )}

          {documentStatus === 'ready' && documentMeta && (
            <PdfCard
              filename={documentMeta.filename}
              size={documentMeta.size}
              pages={documentMeta.pages}
              status="ready"
              onRemove={onRemoveRequest}
            />
          )}

          {documentStatus === 'failed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ErrorMessage
                title="Something went wrong."
                body="We couldn't process this PDF."
                onRetry={onRetry}
              />
              <button className="btn btn-secondary" onClick={onRemoveRequest}>
                Upload a different file
              </button>
            </div>
          )}
        </div>

        {hasDocument && documentStatus !== 'failed' && (
          <button className="btn btn-secondary" onClick={onRemoveRequest} style={{ justifyContent: 'center' }}>
            Upload another
          </button>
        )}
      </aside>
    </>
  );
}
