"use client";

import * as React from "react";
import { Check, Send } from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea, useToast } from "@obsidian/ui";

const TOPICS = [
  { value: "order", label: "An order I placed" },
  { value: "shipping", label: "Delivery or tracking" },
  { value: "return", label: "Return, exchange or refund" },
  { value: "payment", label: "Payment or invoice" },
  { value: "product", label: "A product question" },
  { value: "account", label: "My account" },
  { value: "other", label: "Something else" },
];

export function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    topic: "order",
    orderNumber: "",
    message: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { toast } = useToast();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Tell us your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 15) next.message = "A little more detail helps us help you.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      setSent(true);
      toast({
        title: "Message sent",
        description: "A ticket has been created — check your email for the reference.",
        tone: "success",
      });
    }, 700);
  };

  if (sent) {
    return (
      <Card className="flex flex-col items-center py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
          <Check className="h-7 w-7" strokeWidth={2.4} />
        </span>
        <h2 className="mt-5 font-display display-case text-[24px] text-ink">Thanks — we have it</h2>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">
          Ticket <span className="font-medium text-ink">TKT-{Math.floor(Math.random() * 9000) + 1000}</span> has been
          created. We reply to {form.email} within four working hours.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSent(false);
            setForm({ name: "", email: "", topic: "order", orderNumber: "", message: "" });
          }}
        >
          Send another message
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-display display-case text-[22px] text-ink">Send us a message</h2>
      <p className="mt-1.5 text-[12.5px] text-ink-muted">
        Fields marked with an asterisk are required. Include an order number where you can.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Your name" required htmlFor="c-name" error={errors.name}>
          <Input
            id="c-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            invalid={Boolean(errors.name)}
            autoComplete="name"
          />
        </Field>
        <Field label="Email" required htmlFor="c-email" error={errors.email}>
          <Input
            id="c-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            invalid={Boolean(errors.email)}
            autoComplete="email"
          />
        </Field>
        <Field label="What is this about?" htmlFor="c-topic">
          <Select
            id="c-topic"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          >
            {TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Order number" hint="Starts with OD — optional" htmlFor="c-order">
          <Input
            id="c-order"
            value={form.orderNumber}
            onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
            placeholder="OD123456789"
          />
        </Field>
        <Field label="Message" required className="sm:col-span-2" htmlFor="c-message" error={errors.message}>
          <Textarea
            id="c-message"
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            invalid={Boolean(errors.message)}
            placeholder="Tell us what happened, and what you would like us to do about it."
          />
        </Field>

        <div className="sm:col-span-2">
          <Button type="submit" size="lg" loading={pending}>
            <Send className="h-4 w-4" />
            Send message
          </Button>
          <p className="mt-3 text-[11.5px] text-ink-muted">
            By sending this you agree to us processing the details to answer your query.
          </p>
        </div>
      </form>
    </Card>
  );
}
