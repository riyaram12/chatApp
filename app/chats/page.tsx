"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/chats/myChats");
        setChats(res.data.data || []);
      } catch (err: any) {
        alert("Please login again");
        removeToken();
        router.push("/");
      }
    };
    fetchChats();
  }, [router]);

  // Search API call
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await api.get(`/users/search?query=${searchQuery}`);
        setSearchResults(res.data.data || []);
      } catch (err) {
        console.log("Search API error:", err);
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Click on search result → get or create chat
  const handleUserClick = async (userId: string) => {
    try {
      const res = await api.post("/chats/getOrCreate", { userId });
      const chatId = res.data.data._id;
      router.push(`/chats/${chatId}`);
    } catch (err) {
      console.log("Create chat error:", err);
      alert("Failed to start chat");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Chats</h1>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search users or groups..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
      />

      {/* Conditional rendering */}
      {searchQuery ? (
        <ul>
          {searchResults.map((user) => (
            <li
              key={user._id}
              className="border p-2 mb-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
              onClick={() => handleUserClick(user._id)}
            >
              <img
                src={user.profilePic?.trim() || "/default-avatar.png"}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              {user.username} {user.nickName ? `(${user.nickName})` : ""}
            </li>
          ))}
        </ul>
      ) : (
       <ul>
  {chats.map((chat) => (
    <li
      key={chat._id}
      className="border p-2 mb-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
      onClick={() => router.push(`/chats/${chat._id}`)}
    >
      <div className="flex items-center gap-2">
        {!chat.isGroup && (
          <img
            src={chat.members[0].profilePic || "/default-avatar.png"}
            alt={chat.members[0].username}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <span>
          {chat.isGroup
            ? chat.groupName
            : chat.members.map((m: any) => m.username).join(" & ")}
        </span>
      </div>

      {/*  This shows the button for groups only */}
      {chat.isGroup && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent li click
            router.push(`/chats/${chat._id}/add-members`);
          }}
          className="ml-2 bg-gray-300 px-2 py-1 rounded text-sm"
        >
           Add Members
        </button>
      )}
    </li>
  ))}
</ul>


      )}

      <button
        onClick={() => {
          removeToken();
          router.push("/");
        }}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
