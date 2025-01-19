const SubmissionPageHeader = ({ scansLeft }) => {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 shadow-md">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-wide">
          Job Scam Email Checker
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium">Scans Left:</span>
          <span
            className={`text-2xl font-bold ${
              scansLeft === 0 ? "text-red-500 animate-pulse" : "text-green-400"
            }`}
          >
            {scansLeft}
          </span>
        </div>
      </div>
    </header>
  );
};

export default SubmissionPageHeader;
