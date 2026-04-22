// Importing dependencies
import React, { useState } from "react";
import styled from "styled-components";

// Main page container
const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #f1f5f9;
  padding: 32px 16px;
`;

// Content wrapper
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

// Card container
const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 10px 24px rgba(2, 6, 23, 0.06);
  margin-bottom: 24px;
`;

// Page title
const Title = styled.h1`
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 28px;
  font-weight: 900;
`;

// Subtitle text
const Sub = styled.p`
  margin: 0 0 24px;
  color: #475569;
  line-height: 1.7;
  font-size: 15px;
`;

// Section heading
const SectionTitle = styled.h2`
  margin: 28px 0 16px;
  color: #0f172a;
  font-size: 20px;
  font-weight: 900;
`;

// Contact info grid
const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 20px 0 28px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Individual contact box
const ContactBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

// Contact icon styling
const ContactIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  color: #2563eb;
`;

// Contact label text
const ContactLabel = styled.p`
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 900;
`;

// Contact value text
const ContactValue = styled.p`
  margin: 0;
  color: #475569;
  font-size: 15px;
  word-break: break-all;
`;

// Form styling
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Form row layout
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
  display: block;
`;

const Field = styled.div``;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-size: 14px;
  transition: 0.2s ease;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 0.6);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #ffffff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-size: 14px;
  transition: 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 0.6);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #ffffff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  min-height: 140px;
  resize: vertical;
  font-size: 14px;
  font-family: inherit;
  transition: 0.2s ease;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 0.6);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #ffffff;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px 16px;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s ease;

  &:hover {
    background: #1e40af;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Msg = styled.div`
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  border: 1px solid ${(p) => (p.type === "error" ? "#fecaca" : "#bbf7d0")};
  background: ${(p) => (p.type === "error" ? "#fee2e2" : "#dcfce7")};
  color: ${(p) => (p.type === "error" ? "#991b1b" : "#166534")};
`;

const MapTitle = styled.h3`
  margin: 28px 0 16px;
  color: #0f172a;
  font-size: 18px;
  font-weight: 900;
`;

const MapContainer = styled.div`
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(2, 6, 23, 0.1);

  iframe {
    width: 100%;
    height: 450px;
    border: none;
    display: block;

    @media (max-width: 720px) {
      height: 350px;
    }
  }
`;

const FAQSection = styled.div`
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 24px;
  margin-top: 28px;
`;

const FAQTitle = styled.h3`
  margin: 0 0 16px;
  color: #0f172a;
  font-size: 18px;
  font-weight: 900;
`;

const FAQItem = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FAQQuestion = styled.p`
  margin: 0 0 8px;
  color: #1e40af;
  font-weight: 800;
  font-size: 14px;
`;

const FAQAnswer = styled.p`
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
`;

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // {type, text}

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({
        type: "error",
        text: "Please fill in Name, Email, and Message.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/contact/message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || null,
            subject: form.subject,
            message: form.message.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setStatus({
        type: "success",
        text:
          data.message ||
          "Message sent successfully! We'll get back to you soon.",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Container>
        <Card>
          <Title>Contact myRentals</Title>
          <Sub>
            Have questions about the platform, bookings, payments, or anything
            else? We'd love to hear from you. Get in touch with our team, or
            reach out directly to the founder and CEO.
          </Sub>

          <SectionTitle>Get In Touch</SectionTitle>
          <ContactGrid>
            <ContactBox>
              <ContactIcon>
                <i
                  className="fa-solid fa-envelope"
                  style={{ fontSize: "32px", color: "#2563eb" }}
                />
              </ContactIcon>
              <ContactLabel>Email</ContactLabel>
              <ContactValue>santosh@myrentals.com</ContactValue>
            </ContactBox>

            <ContactBox>
              <ContactIcon>
                <i
                  className="fa-solid fa-phone"
                  style={{ fontSize: "32px", color: "#2563eb" }}
                />
              </ContactIcon>
              <ContactLabel>Phone</ContactLabel>
              <ContactValue>+977 98XXXXXXXX</ContactValue>
            </ContactBox>

            <ContactBox>
              <ContactIcon>
                <i
                  className="fa-solid fa-location-dot"
                  style={{ fontSize: "32px", color: "#2563eb" }}
                />
              </ContactIcon>
              <ContactLabel>Location</ContactLabel>
              <ContactValue>Pokhara, Nepal</ContactValue>
            </ContactBox>
          </ContactGrid>

          <SectionTitle>Send a Message</SectionTitle>
          <Sub>Fill out the form below and we'll respond within 24 hours.</Sub>

          {status && <Msg type={status.type}>{status.text}</Msg>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Field>
                <Label>Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setValue("name", e.target.value)}
                  placeholder="Your full name"
                />
              </Field>

              <Field>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setValue("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </Field>
            </Row>

            <Row>
              <Field>
                <Label>Phone Number (Optional)</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setValue("phone", e.target.value)}
                  placeholder="98XXXXXXXX"
                />
              </Field>

              <Field>
                <Label>Subject</Label>
                <Select
                  value={form.subject}
                  onChange={(e) => setValue("subject", e.target.value)}
                >
                  <option value="general">General Inquiry</option>
                  <option value="booking">Booking Help</option>
                  <option value="payment">Payment / Invoice</option>
                  <option value="owner">Owner Listing</option>
                  <option value="bug">Report a Bug</option>
                  <option value="feedback">Feedback</option>
                </Select>
              </Field>
            </Row>

            <Field>
              <Label>Message *</Label>
              <TextArea
                value={form.message}
                onChange={(e) => setValue("message", e.target.value)}
                placeholder="Please describe your inquiry or message in detail..."
              />
            </Field>

            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </Form>

          <MapTitle>myRentals Office Location</MapTitle>
          <MapContainer>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d878.7216987294528!2d83.98219506649255!3d28.241115499999992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399595002698a59b%3A0x42b1331bd7237c71!2srent%20house!5e0!3m2!1sen!2snp!4v1776691011550!5m2!1sen!2snp"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="myRentals Office Location"
            ></iframe>
          </MapContainer>

          <FAQSection>
            <FAQTitle>Frequently Asked Questions</FAQTitle>

            <FAQItem>
              <FAQQuestion>How quickly will I get a response?</FAQQuestion>
              <FAQAnswer>
                Most inquiries are responded to within 24 hours during business
                days. Urgent issues may be addressed sooner.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion>Can I contact the CEO directly?</FAQQuestion>
              <FAQAnswer>
                Yes! You can reach Santosh Bhandari, the CEO and founder, via
                email at santosh@myrentals.com or through this contact form. We
                encourage direct communication for feedback and feature
                suggestions.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion>What if I have a payment issue?</FAQQuestion>
              <FAQAnswer>
                For payment or invoice-related concerns, please select "Payment
                / Invoice" as the subject when filling out the contact form.
                Include your booking ID and transaction details for faster
                resolution.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion>
                How do I report a bug or technical issue?
              </FAQQuestion>
              <FAQAnswer>
                Please select "Report a Bug" as the subject and describe the
                issue in detail, including the steps to reproduce it. This helps
                us fix problems quickly and improve the platform.
              </FAQAnswer>
            </FAQItem>

            <FAQItem>
              <FAQQuestion>
                I'm interested in becoming an owner. Who should I contact?
              </FAQQuestion>
              <FAQAnswer>
                Select "Owner Listing" as the subject when contacting us. We'll
                guide you through the registration process and answer all your
                questions about listing your rooms.
              </FAQAnswer>
            </FAQItem>
          </FAQSection>
        </Card>
      </Container>
    </Page>
  );
};

export default ContactPage;
