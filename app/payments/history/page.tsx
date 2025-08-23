export default function PaymentHistoryPage() {
  // Later you can fetch from DB/API
  const mockPayments = [
    { id: "pay_123", amount: 500, status: "success", date: "2025-08-10" },
    { id: "pay_124", amount: 1000, status: "failed", date: "2025-08-12" },
  ];

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Payment History</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {mockPayments.map((p) => (
            <tr key={p.id}>
              <td className="p-2 border">{p.id}</td>
              <td className="p-2 border">₹{p.amount}</td>
              <td className="p-2 border">{p.status}</td>
              <td className="p-2 border">{p.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/payments" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded">
        Back to Payments
      </a>
    </div>
  );
}
