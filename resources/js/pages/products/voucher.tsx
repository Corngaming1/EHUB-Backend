import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

export default function VoucherCreate() {
  const [form, setForm] = useState({
    code: "",
    discount_amount: "",
    type: "fixed",
    expires_at: "",
    active: true,
  });
  const [message, setMessage] = useState("");

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;
  setForm(prev => ({
    ...prev,
    [name]: type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : value,
  }));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("/api/admin/vouchers", form);
      setMessage(res.data.message);
      setForm({
        code: "",
        discount_amount: "",
        type: "fixed",
        expires_at: "",
        active: true,
      });
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error creating voucher.");
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: "Products", href: "/products" }, { title: "Create Voucher", href: "/products/voucher" }]}>
      <Head title="Create Voucher" />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Create Voucher</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="code"
            placeholder="Voucher Code"
            value={form.code}
            onChange={handleChange}
            required
          />
          <Input
            type="number"
            name="discount_amount"
            placeholder="Discount Amount"
            value={form.discount_amount}
            onChange={handleChange}
            required
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="fixed">Fixed</option>
            <option value="percent">Percent</option>
          </select>
          <Input
            type="date"
            name="expires_at"
            value={form.expires_at}
            onChange={handleChange}
            required
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            Active
          </label>
          <Button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create Voucher
          </Button>
        </form>
        {message && <div className="mt-4 text-green-600">{message}</div>}
        <Link href="/products" className="block mt-4 text-blue-600 underline">Back to Products</Link>
      </div>
    </AppLayout>
  );
}