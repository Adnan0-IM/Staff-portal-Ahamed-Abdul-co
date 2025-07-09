import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(
        formData.email,
        formData.password,
        formData.remember
      );
      if (success) {
        navigate("/staffportal");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(`${err} An error occurred. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="container shadow-login-shadow rounded-xl p-8 w-[400px] m-auto mt-5 backdrop-blur-[20px] h-[70vh] items-center">
        <h2 className="text-center text-4xl text-[darkblue] font-extrabold tracking-wide">
          LOGIN
        </h2>

        <form
          onSubmit={handleSubmit}
          className="items-center m-auto text-center space-y-4"
        >
          <div className="my-5">
            <label
              className="block mb-1 text-left font-bold ml-5 text-[navy]"
              htmlFor="email"
            >
              Email / Phone Number
            </label>
            <input
              className="w-[90%] p-3 border-3 border-double border-[#ddd] rounded-md bg-white text-[navy] text-sm"
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email / phone number"
            />
          </div>

          <div className="form-group">
            <label
              className="block mb-1 text-left font-bold ml-5 text-[navy]"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-[90%] p-3 border-3 border-double border-[#ddd] rounded-md bg-white text-[navy] text-sm"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-between px-5">
            <label
              className="flex items-center text-left font-bold text-[navy]"
              htmlFor="remember"
            >
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={(e) => handleChange(e)}
                className="mr-2"
              />
              Remember me
            </label>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div className="mt-6">
            <button
              type="submit"
              className="bg-[darkblue] text-white border-none rounded-md py-3 px-4 cursor-pointer w-1/2 ml-auto tracking-wide hover:bg-[navy] transition-colors"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;
