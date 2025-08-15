import React, { useEffect, useState } from "react";
import axios from "axios";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

// Define the type for a voucher
interface Voucher {
  id: number;
  code: string;
  type: string;
  discount_amount: number;
  expires_at: string;
  active: boolean;
  used: boolean;
}

export default function VoucherList() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]); 

  useEffect(() => {
    axios.get("/api/admin/vouchers").then(res => setVouchers(res.data));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    await axios.delete(`/api/admin/vouchers/${id}`);
    setVouchers(vouchers.filter(v => v.id !== id));
  };

  const toggleActive = async (voucher: Voucher) => {
    const updated = { ...voucher, active: !voucher.active };
    await axios.put(`/api/admin/vouchers/${voucher.id}`, updated);
    setVouchers(vouchers.map(v => (v.id === voucher.id ? updated : v)));
  };

  return (
    <AppLayout breadcrumbs={[{ title: "Products", href: "/products" }, { title: "Vouchers", href: "/products/voucher-list" }]}>
      <Head title="Voucher Codes" />
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Available Voucher Codes</h2>
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Code</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Discount</th>
              <th className="border px-2 py-1">Expires At</th>
              <th className="border px-2 py-1">Active</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
        <tbody>
        {vouchers
          .filter(v => !v.used) // <-- Hide vouchers that are already used
          .map((v) => (
            <tr key={v.id}>
              <td className="border px-2 py-1">{v.code}</td>
              <td className="border px-2 py-1">{v.type}</td>
              <td className="border px-2 py-1">{v.discount_amount}</td>
              <td className="border px-2 py-1">{v.expires_at}</td>
              <td className="border px-2 py-1">
                <select
                  value={v.active ? "active" : "inactive"}
                  onChange={() => toggleActive(v)}
                  className="border px-1 py-0.5"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
      </tbody>
        </table>
        <Link href="/products/voucher" className="block mt-4 text-blue-600 underline">Create New Voucher</Link>
      </div>
    </AppLayout>
  );
}
