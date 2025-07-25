import React from 'react';

const PDFDownloadButton = ({ downloadFn, id, label = 'Download PDF', disabled = false }) => {
  const handleDownload = async () => {
    try {
      await downloadFn(id);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled}
      className={`btn-primary px-4 py-2 disabled:opacity-60 transition-colors ${
        disabled ? 'cursor-not-allowed' : 'hover:bg-primary-hover'
      }`}
      aria-label={disabled ? 'Downloading document' : label}
    >
      {disabled ? 'Downloading...' : label}
    </button>
  );
};

export default PDFDownloadButton;