import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser, resetState } from "../redux/slices/userSlice";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [process, setProcess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); // Local state for success message
  const processes = useSelector((state) => state.processes.processes);

  const dispatch = useDispatch();
  const { isLoading, success, error } = useSelector((state) => state.user);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name,
      username,
      password,
      userType,
      process: userType === "Process Department" ? process : undefined,
    };

    dispatch(createUser(userData))
  };

  useEffect(() => {
    if (success) {
      setShowSuccess(true);

      // Reset form fields
      setName("");
      setUsername("");
      setPassword("");
      setUserType("");
      setProcess("");

      // Reset user state after showing success message
      setTimeout(() => {
        dispatch(resetState());
        setShowSuccess(false);
      }, 3000);
    }
  }, [success, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-semibold mb-6">Create User</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">User Type</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          >
            <option value="">Select User Type</option>
            <option value="Admin">Admin</option>
            <option value="Management">Management</option>
            <option value="Merchant">Merchant</option>
            <option value="Process Department">Process Department</option>
          </select>
        </div>
        {userType === "Process Department" && (
          <div className="mb-4">
            <label className="block text-gray-700">Process</label>
            <select
              value={process}
              onChange={(e) => setProcess(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            >
              <option value="">Select Process</option>
              {processes.map((process) => (
                <option value={process}>{process}</option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {showSuccess && (
          <p className="text-green-500 mb-4">User created successfully!</p>
        )}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? "Creating User..." : "Create User"}
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
