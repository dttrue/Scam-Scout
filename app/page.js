
import Link from "next/link";


export default function Home() {


  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Job Scam Email Checker</h1>
      <p className="mb-6">
        Protect yourself from fraudulent job offers. Submit suspicious emails or
        browse flagged examples.
      </p>
      <Link href="/submit" className="btn btn-primary m-2">
        Submit an Email
      </Link>
      <Link href="/job-scan" className="btn btn-primary m-2">
        Scan an Job Listing
      </Link>
      
    </div>
  );
}
