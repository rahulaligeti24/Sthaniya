import React, { useState, useRef } from "react";
import axios from "axios";

export const Form = () => {
  const fileInputRef = useRef(null); 

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.description || !formData.image) {
      setError("Please fill in all fields and select an image.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("description", formData.description);
    data.append("image", formData.image);

    try {
      const res = await axios.post("http://localhost:5000/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(res.data.message || "Uploaded successfully!");

      // ✅ Reset form fields
      setFormData({
        name: "",
        email: "",
        description: "",
        image: null,
      });

      // ✅ Clear file input field visually
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">Add Post</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Write a description..."
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            ref={fileInputRef} // Assign ref
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-200"
        >
          {loading ? "Uploading..." : "Submit"}
        </button>

        {success && <p className="text-center mt-4 text-sm font-medium text-green-500">{success}</p>}
        {error && <p className="text-center mt-4 text-sm font-medium text-red-500">{error}</p>}
      </form>
    </div>
  );
};
