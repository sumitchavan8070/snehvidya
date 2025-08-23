export default function PaymentsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-3xl font-bold">Payments Dashboard</h1>
      <p className="text-gray-600">Choose an action below:</p>

      <div className="flex space-x-4 mt-6">
        <a href="/payments/checkout" className="px-6 py-3 bg-blue-600 text-white rounded">
          Checkout
        </a>
        <a href="/payments/history" className="px-6 py-3 bg-gray-200 rounded">
          Payment History
        </a>
      </div>
    </div>
  );
}
