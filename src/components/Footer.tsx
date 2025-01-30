// components/Footer.tsx
export const Footer = () => (
    <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4 text-sm">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="contact-us text-gray-700">
            <p className="leading-relaxed">
              For questions or feedback, please visit{" "}
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSfMeejDbCv9lcc8nkYKMHpbsTMDlwbcoYx0eYG1cu5lT4yK7g/viewform" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                [link to google form]
              </a>
              . For more information about the BioData Catalyst, please visit{" "}
              <a 
                href="https://biodatacatalyst.nhlbi.nih.gov/" 
                className="text-blue-600 hover:text-blue-800 underline break-words"
              >
                https://biodatacatalyst.nhlbi.nih.gov/
              </a>
              .
            </p>
          </div>          
          <div className="disclaimer-container">
            <p className="font-medium text-gray-800 mb-2">Disclaimer:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li className="leading-relaxed">
                The chatbot logs will be de-identified and preserved by the BioData Catalyst Study Chatbot Team for
                quality assurance purposes, though not shared with the public.
              </li>
              <li className="leading-relaxed">
                The chatbot is designed to answer queries about study abstracts and find studies that might be relevant
                to the user. Any queries outside of that core scope might result in inaccurate, erroneous, or fabricated
                responses due to design principles of the underlying LLM. Please exercise caution when executing such
                queries.
              </li>
              <li className="leading-relaxed">
                The chatbot does not have full implementation of content moderation guardrails, and therefore
                conversations outside of the abovementioned scope may result in uncouth or inappropriate responses.
              </li>
            </ul>
          </div>
        </div>
    </footer>
  );