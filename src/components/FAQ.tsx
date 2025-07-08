

const FAQ = () => {
  return (
    <section className="bg-transparent p-4 w-screen flex flex-col max-w-full my-20 mx-auto bg-[url('assets/Ahmad.svg')] bg-center bg-cover leading-6 bg-no-repeat items-center">
      <h1 id="faq" className="text-[2rem] text-center text-[#1c1e3a] mt-8">
        FAQs
      </h1>
      <p className="text-center text-[1.3rem] text-[#666] mb-10 max-w-[800px] mt-8">
        Find answers to commonly asked questions about the services provided by
        Ahmed Abdul & Co.
      </p>

      <div className="border-[0.5px] max-w-[800px] rounded-md border-black faq-item mb-4">
        <input
          className="hidden peer max-h-[200px] p-[10px] mb-4"
          type="checkbox"
          id="faq1"
        />
        <label
          htmlFor="faq1"
          className="faq-question text-xl font-semibold mb-2 flex items-center justify-between text-[1.2rem] cursor-pointer py-[15px] px-[10px] relative text-[#333]"
        >
          What services are offered?<span className="faq-icon">+</span>
        </label>
        <div className="px-4 faq-answer max-h-0 overflow-hidden transition-all duration-300 ease-in-out peer-checked:max-h-52 peer-checked:py-2 peer-checked:mb-4">
          Ahmed Abdul & Co offers a wide range of professional services
          including auditing, tax analysis, business advisory, insolvency, and
          more. Our team of experienced professionals is dedicated to providing
          world-class solutions to our clients.
        </div>
      </div>

      <div className="border-[0.5px] max-w-[800px] rounded-md border-black faq-item mb-4">
        <input
          className="hidden peer max-h-[200px] p-[10px] mb-4"
          type="checkbox"
          id="faq2"
        />
        <label
          htmlFor="faq2"
          className="faq-question text-xl font-semibold mb-2 flex items-center justify-between text-[1.2rem] cursor-pointer py-[15px] px-[10px] relative text-[#333]"
        >
          How can I contact you?<span className="faq-icon">+</span>
        </label>
        <div className="px-4 faq-answer max-h-0 overflow-hidden transition-all duration-300 ease-in-out peer-checked:max-h-52 peer-checked:py-2 peer-checked:mb-4">
          You can contact us by filling out the contact form on our website or
          by calling our office directly. We are always available to assist you
          with any inquiries or concerns.
        </div>
      </div>

      <div className="border-[0.5px] max-w-[800px] rounded-md border-black faq-item mb-4">
        <input
          className="hidden peer max-h-[200px] p-[10px] mb-4"
          type="checkbox"
          id="faq3"
        />
        <label
          htmlFor="faq3"
          className="faq-question text-xl font-semibold mb-2 flex items-center justify-between text-[1.2rem] cursor-pointer py-[15px] px-[10px] relative text-[#333]"
        >
          What is your expertise?<span className="faq-icon">+</span>
        </label>
        <div className="px-4 faq-answer max-h-0 overflow-hidden transition-all duration-300 ease-in-out peer-checked:max-h-52 peer-checked:py-2 peer-checked:mb-4">
          Our team of professionals has expertise in various areas including
          auditing, tax analysis, business advisory, insolvency, public sector
          and corporate finance, strategic management, human resource services,
          and more. We are well-equipped to handle diverse client needs.
        </div>
      </div>

      <div className="border-[0.5px] max-w-[800px] rounded-md border-black faq-item mb-4">
        <input
          className="hidden peer max-h-[200px] p-[10px] mb-4"
          type="checkbox"
          id="faq4"
        />
        <label
          htmlFor="faq4"
          className="faq-question text-xl font-semibold mb-2 flex items-center justify-between text-[1.2rem] cursor-pointer py-[15px] px-[10px] relative text-[#333]"
        >
          Do you offer training?<span className="faq-icon">+</span>
        </label>
        <div className="px-4 faq-answer max-h-0 overflow-hidden transition-all duration-300 ease-in-out peer-checked:max-h-52 peer-checked:py-2 peer-checked:mb-4">
          Yes, we provide corporate training services to enhance the skills and
          knowledge of our clients. Our training programs are tailored to meet
          specific business requirements and are conducted by industry experts.
        </div>
      </div>

      <div className="border-[0.5px] max-w-[800px] rounded-md border-black faq-item mb-4">
        <input
          className="hidden peer max-h-[200px] p-[10px] mb-4"
          type="checkbox"
          id="faq5"
        />
        <label
          htmlFor="faq5"
          className="faq-question text-xl font-semibold mb-2 flex items-center justify-between text-[1.2rem] cursor-pointer py-[15px] px-[10px] relative text-[#333]"
        >
          What is your policy?<span className="faq-icon">+</span>
        </label>
        <div className="px-4 faq-answer max-h-0 overflow-hidden transition-all duration-300 ease-in-out peer-checked:max-h-52 peer-checked:py-2 peer-checked:mb-4">
          At Ahmed Abdul & Co, we are committed to maintaining the highest level
          of confidentiality, providing value-added services, delivering quality
          and excellence, and upholding integrity in all our dealings. We adhere
          to legislative and regulatory requirements to ensure transparency and
          trust.
        </div>
      </div>

      <div className="text-black">
        <h2 className="text-2xl font-bold">Still have questions?</h2>
        <p className="my-6">Contact us for further assistance</p>
      </div>
    </section>
  );
};

export default FAQ;
