import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import { Bezel, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Contact", description: "Contact the Maritime Expo Asia 2027 team." };

export default function Contact() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Contact us">
        For enquiries about Maritime Expo Asia 2027 or the Sarawak Maritime Industry Summit 2027, send us a message
        and our team will respond.
      </PageHeader>
      <Section>
        <Reveal className="max-w-3xl">
          <Bezel>
            <div className="p-6 sm:p-9">
              <EnquiryForm types={["contact"]} />
            </div>
          </Bezel>
        </Reveal>
      </Section>
    </>
  );
}
