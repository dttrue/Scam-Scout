export default function FraudScoreDisplay({ fraudScore, explanation }) {
  const getRiskLevel = (score) => {
    if (score <= 30) return { level: "Low Risk", color: "green" };
    if (score <= 70) return { level: "Medium Risk", color: "yellow" };
    return { level: "High Risk", color: "red" };
  };

  const risk = getRiskLevel(fraudScore);

  return (
    <div className="fraud-score">
      <h2 className="text-xl font-bold">Fraud Score</h2>
      <p className={`text-lg font-semibold text-${risk.color}-600`}>
        {fraudScore} - {risk.level}
      </p>
      <p className="text-gray-600">
        The fraud score indicates the likelihood of fraudulent activity based on
        the provided information.
      </p>
      {explanation && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">Explanation</h3>
          <p className="text-gray-700">{explanation}</p>
        </div>
      )}
    </div>
  );
}
