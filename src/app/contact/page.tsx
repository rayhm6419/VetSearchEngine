export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Contact Us
      </h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-neutral-300">
          Get in touch with the PetCare team. Whether you have questions, feedback, or need to report an issue, we&apos;re here to help.
        </p>
        <p className="text-gray-600 dark:text-neutral-300 mt-4">
          Email us at: <a href="mailto:hello@petcare.example" className="text-blue-600 dark:text-blue-400 hover:underline">hello@petcare.example</a>
        </p>
        <p className="text-gray-600 dark:text-neutral-300 mt-4">
          This is a placeholder page. A full contact form will be available soon.
        </p>
      </div>
    </div>
  );
}