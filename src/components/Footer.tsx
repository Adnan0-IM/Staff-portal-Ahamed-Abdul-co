import bellIcon from '../assets/bell-icon.jpg';

const Footer = () => {
  return (
      <footer className="bg-gradient-to-b from-[#0d1321] via-[#0f2743] to-[#062654] text-white text-center p-4 leading-8 static bottom-0 w-full">
        <div className="flex flex-wrap justify-around max-sm:flex-col md:place-items-start gap-6 ">
            <div className="footer-section">
                <h2 className="text-bold text-2xl">About Us</h2>
                <p className="text-[lightcyan] text-base"><a href="ABOUT US.html" className="text-white no-underline">About Us</a></p>
                <p className="text-[lightcyan] text-base"><a href="services.html" className="text-white no-underline">Services</a></p>
                <p className="text-[lightcyan] text-base"><a href="contact.html" className="text-white no-underline">Contact</a></p>
                <p className="text-[lightcyan] text-base"><a href="#faq" className="text-white no-underline">FAQ</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Terms</a></p>
                <p className="text-[lightcyan] text-base"><a href="#privacy" className="text-white no-underline">Privacy</a></p>
            </div>
            <div className="footer-section">
                <h2 className="text-bold text-2xl">Blog</h2>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Blog</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Support</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Career</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Partner</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Investors</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">News</a></p>
            </div>
            <div className="footer-section">
                <h2 className="text-bold text-2xl">Resources</h2>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Community</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Events</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Testimony</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Case Studies</a></p>
            </div>
            <div className="footer-section">
                <h2 className="text-bold text-2xl">Downloads</h2>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Pricing</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Features</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Demo</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">FAQ</a></p>
                <p className="text-[lightcyan] text-base"><a href="#" className="text-white no-underline">Support</a></p>
            </div>

            
            <div>
                <h1 className="text-[cyan] text-3xl font-bold">Subscribe to our Newsletter</h1>
                <p className="text-[lightcyan] text-base" style={{backgroundImage: 'linear-gradient(#0d1321,#0f2743, #062654)'}}>
                    Stay updated with the latest insights and updates from Ahmed Abdul & Co.
                </p>
                <form action="YOUR_BACKEND_ENDPOINT" method="post" className="m-auto w-full bg-blue-50 sm:bg-white p-2 rounded-md flex items-center flex-col gap-4 sm:gap-0 sm:flex-row shadow-md mt-4">
                    <div className="rounded-[50%] w-16 h-12 flex justify-center items-center mr-4">
                        <img src={bellIcon} alt="Notification Icon" width="40" height="auto"/>
                    </div>
                    <label htmlFor="email" className="sr-only">Your email:</label>
                    <input className="p-2 mr-4  border-2 border-[#ddd] rounded-md flex-grow " type="email" id="email" name="email" placeholder="Your email" required />
                    <input className="hover:bg-[#0056b3] py-2 px-4 bg-[#256dd3] text-white border-0 rounded-md cursor-pointer " type="submit" value="Subscribe" />
               
                </form>
                <p className="text-[lightcyan] text-base mt-4">By subscribing, you agree to our Terms and Conditions.</p>
            </div>
        </div>
        <p className="text-[lightcyan] text-base">&copy; 2024 AHMED ABDUL & CO. All rights reserved.</p>
    </footer>
  )
}

export default Footer