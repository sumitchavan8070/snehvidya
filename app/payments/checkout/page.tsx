import PaymentButton from "../_components/PaymentButton";

export default function CheckoutPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 bg-white rounded shadow-md text-center">
        <h2 className="text-xl font-bold mb-4">Checkout</h2>
        <p className="mb-6">Proceed to make your payment</p>
        <PaymentButton /> {/* Pay ₹500 */}
      </div>
    </div>
  );
}
