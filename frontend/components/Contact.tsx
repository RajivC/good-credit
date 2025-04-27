// components/Contact.tsx
import React from 'react';

export function Contact() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        Contact Us
      </h2>
      <form
        action="https://formspree.io/f/xanonkoo" 
        method="POST"
        className="space-y-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="message"
          placeholder="Your Message"
          rows={5}
          required
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}