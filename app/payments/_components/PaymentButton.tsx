"use client";



interface Props {
  amount?: string;
}

export default function PaymentButton({ amount = "10.00" }: Props) {
  const startPayment = async () => {
    try {
      const res = await fetch("/api/payu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnid: "txn_" + Date.now(),
          amount,
          productinfo: "Reusable Product",
          firstname: "User",
          email: "user@example.com",
          phone: "9999999999",
        }),
      });

      if (!res.ok) {
        throw new Error(`API request failed: ${res.status}`);
      }

      const data = await res.json();

      if (data.hash) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = `${process.env.NEXT_PUBLIC_PAYU_BASE_URL}/_payment`;

        Object.entries(data).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        console.error("Invalid PayU response:", data);
        alert("Something went wrong while preparing payment.");
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Unable to start payment. Please try again.");
    }
  };

  return (
    <button
      onClick={startPayment}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Pay ₹{amount}
    </button>
  );
}
