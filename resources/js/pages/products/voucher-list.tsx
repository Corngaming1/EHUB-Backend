import React, { useEffect, useState } from "react";
import axios from "axios";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

export default function VoucherList() {
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/vouchers").then(res => setVouchers(res.data));
  }, []);

  return (
    <AppLayout breadcrumbs={[{ title: "Products", href: "/products" }, { title: "Vouchers", href: "/products/voucher-list" }]}>
      <Head title="Voucher Codes" />
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Available Voucher Codes</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Code</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Discount</th>
              <th className="border px-2 py-1">Expires At</th>
              <th className="border px-2 py-1">Active</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v: any) => (
              <tr key={v.id}>
                <td className="border px-2 py-1">{v.code}</td>
                <td className="border px-2 py-1">{v.type}</td>
                <td className="border px-2 py-1">{v.discount_amount}</td>
                <td className="border px-2 py-1">{v.expires_at}</td>
                <td className="border px-2 py-1">{v.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link href="/products/voucher" className="block mt-4 text-blue-600 underline">Create New Voucher</Link>
      </div>
    </AppLayout>
  );
}