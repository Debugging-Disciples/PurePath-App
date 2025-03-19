import React, { useState } from "react";
import { FaDiscord, FaInstagram, FaLinkedin, FaLink } from "react-icons/fa";
import { db } from "@/utils/firebase";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

const SocialMediaLinks = ({ userId }) => {
  const [socialMedia, setSocialMedia] = useState({
    discord: "",
    instagram: "",
    linkedin: "",
    other: "",
  });

  // Fetch initial data from Firestore
  React.useEffect(() => {
    const fetchSocialMedia = async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSocialMedia(docSnap.data().socialMedia || {});
      }
    };

    fetchSocialMedia();
  }, [userId]);

  const handleInputChange = async (platform, value) => {
    const updatedLinks = { ...socialMedia, [platform]: value };
    setSocialMedia(updatedLinks);

    // Write to Firebase
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { socialMedia: updatedLinks }, { merge: true });
  };

  const handleDelete = async (platform) => {
    const updatedLinks = { ...socialMedia, [platform]: "" };
    setSocialMedia(updatedLinks);

    // Write updated data to Firebase
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { [`socialMedia.${platform}`]: "" });
  };

  const platforms = [
    { name: "Discord", key: "discord", icon: <FaDiscord /> },
    { name: "Instagram", key: "instagram", icon: <FaInstagram /> },
    { name: "LinkedIn", key: "linkedin", icon: <FaLinkedin /> },
    { name: "Other", key: "other", icon: <FaLink /> },
  ];

  return (
    <div>
      <h3 className="font-medium mb-4">Social Media Links</h3>
      <div className="flex space-x-4">
        {platforms.map((platform) => (
          <div key={platform.key} className="relative">
            <button
              onClick={() => {
                const link = prompt(`Enter your ${platform.name} link:`);
                if (link !== null) handleInputChange(platform.key, link);
              }}
              className={`text-3xl ${
                socialMedia[platform.key]
                  ? "opacity-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {platform.icon}
            </button>
            {socialMedia[platform.key] && (
              <div className="mt-2">
                <p className="text-sm">{socialMedia[platform.key]}</p>
                <button
                  onClick={() =>
                    handleInputChange(
                      platform.key,
                      prompt(`Edit your ${platform.name} link:`)
                    )
                  }
                  className="text-blue-500 text-xs mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(platform.key)}
                  className="text-red-500 text-xs"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaLinks;
