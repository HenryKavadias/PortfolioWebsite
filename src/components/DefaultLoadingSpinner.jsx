import '../css/DefaultLoadingSpinner.css';

function DefaultLoadingSpinner() {
  return (
    <div className="loading-spinner-container" role="status" aria-label="Loading">
      <div className="loading-spinner"></div>
    </div>
  );
}

export default DefaultLoadingSpinner;
