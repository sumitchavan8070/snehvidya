import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { txnid, amount, productinfo, firstname, email, phone } = body;

    const key = process.env.PAYU_MERCHANT_KEY!;
    const salt = process.env.PAYU_MERCHANT_SALT!;

    // Construct hash string
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    return Response.json({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: "http://172.23.17.239:3000/payments/success", // success callback
      furl: "http://172.23.17.239:3000/payments/failure", // failure callback
      hash,
    });
  } catch (error) {
    console.error("PayU API Error:", error);
    return Response.json(
      { error: "Failed to generate PayU request" },
      { status: 500 }
    );
  }
}
