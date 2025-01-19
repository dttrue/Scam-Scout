import Cookies from "js-cookie";

export const getScanData = () => {
  const scanData = JSON.parse(Cookies.get("scanData") || "{}");

  if (!scanData.resetAt || new Date() > new Date(scanData.resetAt)) {
    // Reset scans if the resetAt time has passed
    const resetAt = new Date().setUTCHours(24, 0, 0, 0); // Next midnight
    const newScanData = { count: 0, jobListingCount: 0, resetAt };
    Cookies.set("scanData", JSON.stringify(newScanData));
    return newScanData;
  }

  // Ensure counts are properly initialized
  scanData.count = scanData.count || 0; // Default to 0 if undefined
  scanData.jobListingCount = scanData.jobListingCount || 0; // Default to 0 if undefined

  return scanData;
};

export const incrementScanCount = () => {
  const scanData = getScanData();

  if (scanData.count >= 3) {
    alert(
      "You have reached your daily limit of 3 email scans. Sign up to get more scans!"
    );
    return false; // Prevent further scans
  }

  scanData.count += 1;
  Cookies.set("scanData", JSON.stringify(scanData));
  return true;
};

export const incrementJobListingScanCount = () => {
  const scanData = getScanData();

  if (scanData.jobListingCount >= 1) {
    alert(
      "You have reached your daily limit of 1 job listing scan. Sign up to get more scans!"
    );
    return false; // Prevent further scans
  }

  scanData.jobListingCount += 1;
  Cookies.set("scanData", JSON.stringify(scanData));
  return true;
};
