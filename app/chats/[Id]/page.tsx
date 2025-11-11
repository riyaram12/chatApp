"use client";

import { useParams } from "next/navigation";
import { useEffect, useState} from "react";
import api from "@/lib/api";
import socket from "@/lib/socket";

export default function ChatWindow() {
  const { Id } = useParams<{ Id: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
 // const messagesEndRef=useRef<HTMLDivElement | null>(null);

  //  New state to hold chat info (group members)
  const [chat, setChat] = useState<any>(null);
  const [newMemberId, setNewMemberId] = useState("");


  useEffect(() => {
    const username = localStorage.getItem("chatapp_username");
    setCurrentUser(username);
  }, []);

  //  Fetch messages and chat info
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await api.get(`/messages/${Id}`);
        setChat(res.data.data);
      } catch (err) {
        console.log("Fetch chat error:", err);
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${Id}`);
        setMessages(res.data.data || []);
      } catch {
        alert("Failed to load messages");
      }
    };

    fetchChat();
    fetchMessages();
  }, [Id]);

  useEffect(() => {
    socket.emit("join_chat", Id);
    //console.log("socket ID ::00", Id);
    


    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      //show notification 
      if(document.hidden){
        //browser notification
        if(Notification.permission==="granted"){
          new Notification("new messages",{
            body: msg.content,
            icon:"/logo.png",
          });

        } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [Id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await api.post("/messages/send", {
        chatId: Id,
        content,
      });
      const savedMessage = res.data.data;
      console.log("saveMessages:::",savedMessage._id);
    //  setMessages((prev) => [ savedMessage]);
    setMessages((prev) => {
    if (prev.some((m) => m._id === savedMessage._id)) 
      {

        //console.log("If")
        return prev;
      }
    return [...prev, savedMessage];
});

      setContent("");
    } catch (e: any) {
      console.log(e.response || e);
      alert(e.response?.data?.message || "Failed to send message");
    }
  };

 // Remove member function
const handleRemoveMember = async (member: any) => {
  if (!confirm(`Are you sure you want to remove ${member.username}?`)) return;

  try {
    const res = await api.post("/chats/remove-member", {
      chatId: Id,
      members: [member._id], // pass the _id inside an array
    });

    alert("Member removed successfully ");

    // Update members in frontend immediately
    setChat((prev: any) => ({
      ...prev,
      members: prev.members.filter((m: any) => m._id !== member._id),
    }));
  } catch (err: any) {
    console.error("Remove member error:", err);
    alert(err.response?.data?.message || "Failed to remove member");
  }
};

//  Add Member function
const handleAddMember = async (newMember: any) => {
  // Check if already exists in chat.members
  const alreadyExists = chat.members.some(
    (m: any) => m._id === newMember._id
  );

  if (alreadyExists) {
    alert("This user is already in the group");
    return;
  }

  try {
    const res = await api.post("/chats/add-member", {
      chatId: Id,
      members: [newMember._id], // must be array
    });

    alert("Member added successfully ");

    // Update frontend UI without reload
    setChat((prev: any) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
  } catch (err: any) {
    console.error("Add member error:", err);
    alert(err.response?.data?.message || "Failed to add member");
  }
};


  return (
  <div className="flex flex-col h-screen">
    
    {/*  Group Members (for group chat) */}
   {chat?.isGroup && (
  <div className="border-b bg-gray-100 p-3">
    <h2 className="text-lg font-semibold mb-2">
      Group: {chat.groupName || "Unnamed Group"}
    </h2>

    {/*  Members List */}
    <div>
      <h3 className="text-sm font-semibold mb-1">Members:</h3>
      {chat.members.map((m: any) => (
        <div
          key={m._id}
          className="flex items-center gap-2 mb-1 border p-2 rounded"
        >
          <img
            src={m.profilePic || "/default-avatar.png"}
            alt={m.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span>{m.username}</span>
          <button
            onClick={() => handleRemoveMember(m)}
            className="ml-auto bg-red-500 text-white px-2 py-1 rounded text-sm"
          >
            Remove
          </button>
        </div>
      ))}
    </div>

    {/*  Add Member Input */}
    <div className="flex gap-2 mt-3">
      <input
        type="text"
        placeholder="Enter user ID to add"
        value={newMemberId}
        onChange={(e) => setNewMemberId(e.target.value)}
        className="border p-2 rounded flex-1"
      />
      <button
        onClick={() => handleAddMember({ _id: newMemberId })}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Add
      </button>
    </div>
  </div>
)}


    {/*  Messages container */}
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.map((msg, index) => {
        const username = msg.senderId?.username || "Unknown";
        const profilePic =
          msg.senderId?.profilePic?.trim() || "/default-avatar.png";
        const isMe = username === currentUser;

        return (
          <div
            key={`${msg._id}-${index}`}
            className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            {!isMe && (
              <img
                src={profilePic}
                alt={username}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
            )}

            <div
              className={`px-3 py-2 rounded-lg max-w-xs ${
                isMe ? "bg-green-500 text-white" : "bg-gray-300 text-black"
              }`}
            >
              <strong className="block text-sm">{username}</strong>
              {msg.content}
            </div>
          </div>
        );
      })}
    </div>

    {/*  Input box */}
    <form onSubmit={sendMessage} className="p-4 flex gap-2 border-t">
      <input
        className="flex-1 border p-2 rounded"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Send
      </button>
    </form>
  </div>
);

}
