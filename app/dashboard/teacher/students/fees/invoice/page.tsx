"use client"

import Image from "next/image"
import "./invoice.css" // ensure your invoice styles are here

export default function Invoice() {
  return (
    <div className="invoice-page">
      <div className="tm_invoice_wrap">
        <div className="tm_invoice tm_style1" id="tm_download_section">
          <div className="tm_invoice_in">
            {/* Header */}
            <div className="tm_invoice_head tm_align_center tm_mb20">
              <div className="tm_invoice_left">
                <div className="tm_logo">
                  <Image src="/logo.svg" alt="Logo" width={120} height={60} />
                </div>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <div className="tm_primary_color tm_f50 tm_text_uppercase">Invoice</div>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="tm_invoice_info tm_mb20">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number tm_m0">
                  Invoice No: <b className="tm_primary_color">#LL93784</b>
                </p>
                <p className="tm_invoice_date tm_m0">
                  Date: <b className="tm_primary_color">01.07.2022</b>
                </p>
              </div>
            </div>

            {/* Billing Info */}
            <div className="tm_invoice_head tm_mb10">
              <div className="tm_invoice_left">
                <p className="tm_mb2">
                  <b className="tm_primary_color">Invoice To:</b>
                </p>
                <p>
                  Lowell H. Dominguez <br />
                  84 Spilman Street, London <br />
                  United Kingdom <br />
                  lowell@gmail.com
                </p>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <p className="tm_mb2">
                  <b className="tm_primary_color">Pay To:</b>
                </p>
                <p>
                  Laralink Ltd <br />
                  86-90 Paul Street, London
                  <br />
                  England EC2A 4NE <br />
                  demo@gmail.com
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <table>
                    <thead>
                      <tr>
                        <th className="tm_width_3 tm_semi_bold tm_primary_color tm_gray_bg">Item</th>
                        <th className="tm_width_4 tm_semi_bold tm_primary_color tm_gray_bg">Description</th>
                        <th className="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg">Price</th>
                        <th className="tm_width_1 tm_semi_bold tm_primary_color tm_gray_bg">Qty</th>
                        <th className="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg tm_text_right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="tm_width_3">1. Website Design</td>
                        <td className="tm_width_4">Six web page designs and three times revision</td>
                        <td className="tm_width_2">$350</td>
                        <td className="tm_width_1">1</td>
                        <td className="tm_width_2 tm_text_right">$350</td>
                      </tr>
                      <tr>
                        <td className="tm_width_3">2. Web Development</td>
                        <td className="tm_width_4">Convert pixel-perfect frontend and make it dynamic</td>
                        <td className="tm_width_2">$600</td>
                        <td className="tm_width_1">1</td>
                        <td className="tm_width_2 tm_text_right">$600</td>
                      </tr>
                      <tr>
                        <td className="tm_width_3">3. App Development</td>
                        <td className="tm_width_4">Android &amp; Ios Application Development</td>
                        <td className="tm_width_2">$200</td>
                        <td className="tm_width_1">2</td>
                        <td className="tm_width_2 tm_text_right">$400</td>
                      </tr>
                      <tr>
                        <td className="tm_width_3">4. Digital Marketing</td>
                        <td className="tm_width_4">Facebook, Youtube and Google Marketing</td>
                        <td className="tm_width_2">$100</td>
                        <td className="tm_width_1">3</td>
                        <td className="tm_width_2 tm_text_right">$300</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="tm_invoice_footer">
                <div className="tm_left_footer">
                  <p className="tm_mb2">
                    <b className="tm_primary_color">Payment info:</b>
                  </p>
                  <p className="tm_m0">
                    Credit Card - 236***********928 <br />
                    Amount: $1732
                  </p>
                </div>
                <div className="tm_right_footer">
                  <table>
                    <tbody>
                      <tr>
                        <td className="tm_width_3 tm_primary_color tm_border_none tm_bold">Subtotal</td>
                        <td className="tm_width_3 tm_primary_color tm_text_right tm_border_none tm_bold">
                          $1650
                        </td>
                      </tr>
                      <tr>
                        <td className="tm_width_3 tm_primary_color tm_border_none tm_pt0">
                          Tax <span className="tm_ternary_color">(5%)</span>
                        </td>
                        <td className="tm_width_3 tm_primary_color tm_text_right tm_border_none tm_pt0">
                          +$82
                        </td>
                      </tr>
                      <tr className="tm_border_top tm_border_bottom">
                        <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_primary_color">
                          Grand Total
                        </td>
                        <td className="tm_width_3 tm_border_top_0 tm_bold tm_f16 tm_primary_color tm_text_right">
                          $1732
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="tm_padd_15_20 tm_round_border">
              <p className="tm_mb5">
                <b className="tm_primary_color">Terms &amp; Conditions:</b>
              </p>
              <ul className="tm_m0 tm_note_list">
                <li>
                  All claims relating to quantity or shipping errors shall be waived by Buyer unless made in writing
                  to Seller within thirty (30) days after delivery of goods to the address stated.
                </li>
                <li>
                  Delivery dates are not guaranteed and Seller has no liability for damages due to any delay in
                  shipment. Taxes are excluded unless otherwise stated.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="tm_invoice_btns tm_hide_print">
          <button onClick={() => window.print()} className="tm_invoice_btn tm_color1">
            Print
          </button>
        </div>
      </div>
    </div>
  )
}
