import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy notice", description: "How we use the personal data you send us." };

// [TBC] Owner to review; entity name and contact email to be confirmed.
export default function Privacy() {
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy notice" />
      <Section tone="white">
        <Reveal className="max-w-2xl space-y-5 text-lg text-ink/80">
          <p>
            When you submit a form on this website, we collect your name, company, role, email address, phone or
            WhatsApp number and your message.
          </p>
          <p>
            We use this personal data solely to communicate with you about Maritime Expo Asia 2027, the Sarawak
            Maritime Industry Summit 2027 and related events. We do not sell your personal data.
          </p>
          <p>
            Your data is stored securely and is accessible only to the event team. You may request access to, correction
            of or deletion of your data at any time through our{" "}
            <Link href="/contact" className="text-deep underline underline-offset-4">
              contact form
            </Link>
            .
          </p>
        </Reveal>
      </Section>
    </>
  );
}
