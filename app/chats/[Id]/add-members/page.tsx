"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";

export default function AddMembersPage() {
  const { id } = useParams<{ id: string }>(); // Group chat ID
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  //  Search users API
  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }

      const res = await api.get(`/users/search?query=${searchQuery}`);
      setSearchResults(res.data.data || []);
    };
    const timeout = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  //  Add/remove users from selection
  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  //  Call backend API to add members
  const handleAddMembers = async () => {
    try {
      const res = await api.post("/chats/add-member", {
        chatId: id,
        members: selectedMembers,
      });
      alert("Members added successfully!");
      console.log("Updated chat:", res.data.data);
    } catch (e: any) {
      console.log(e);
      alert(e.response?.data?.message || "Failed to add members");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Members to Group</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
      />

      <ul>
        {searchResults.map((user) => (
          <li
            key={user._id}
            onClick={() => toggleMember(user._id)}
            className={`p-2 mb-2 border rounded cursor-pointer flex items-center gap-2 ${
              selectedMembers.includes(user._id) ? "bg-green-200" : "bg-white"
            }`}
          >
            <img
              src={user.profilePic?.trim() || "/default-avatar.png"}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            {user.username}
          </li>
        ))}
      </ul>

      {selectedMembers.length > 0 && (
        <button
          onClick={handleAddMembers}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add {selectedMembers.length} Member
          {selectedMembers.length > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}
