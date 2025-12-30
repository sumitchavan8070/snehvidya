  "use client";
  import React, { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import Image from "next/image";
  import { toast } from "sonner";
  // Assuming these are the correct imports for your component library
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { useModal } from "@/app/calender/component/useModal";
  import { Modal } from "@/app/calender/modal";
  import { api } from "@/lib/api";

  interface User {
    id: number;
    username?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    bio?: string;
    country?: string;
    cityState?: string;
    postalCode?: string;
    taxId?: string;
    profileImageUrl?: string;
    profile_image?: string;
    role: {
      id: number;
      name: string;
      description: string;
      isActive: boolean;
    };
    school: {
      id: number;
      name: string;
      address: string;
      phone: string;
      email: string;
      website: string;
      description: string;
      isActive: boolean;
    };
  }

  // Dummy data to display if localStorage is empty or malformed
  const dummyUser: User = {
    id: 1,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Full-stack developer and team lead.",
    country: "United States",
    cityState: "San Francisco, CA",
    postalCode: "94105",
    taxId: "TX-12345",
    role: {
      id: 1,
      name: "Admin",
      description: "System administrator",
      isActive: true,
    },
    school: {
      id: 1,
      name: "Tech Academy",
      address: "123 Learning Lane",
      phone: "555-987-6543",
      email: "info@techacademy.edu",
      website: "www.techacademy.edu",
      description: "A leading tech education institution.",
      isActive: true,
    },
  };

  export default function UserMetaCard() {
    const { isOpen, openModal, closeModal } = useModal();
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<User | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const router = useRouter();

    useEffect(() => {
      // Load basic user information from localStorage (existing behaviour)
      try {
        const rawUser = localStorage.getItem("user");
        let parsedUser: User;

        if (!rawUser) {
          toast.error("User not found in local storage. Using dummy data.");
          parsedUser = dummyUser;
        } else {
          parsedUser = JSON.parse(rawUser);

          if (!parsedUser || !parsedUser.firstName) {
            toast.error("User data is malformed. Using dummy data.");
            console.log("Parsed user data:", parsedUser);
            parsedUser = dummyUser;
          } else {
            toast.success(`Welcome ${parsedUser.firstName}`);
          }
        }

        setUser(parsedUser);
        setFormData(parsedUser);
        setIsDataLoaded(true);
      } catch (error) {
        toast.error("Failed to parse user data. Using dummy data.");
        console.error("Error parsing user data from localStorage:", error);
        setUser(dummyUser);
        setFormData(dummyUser);
        setIsDataLoaded(true);
      }

      // Fetch server-side profile (including profile image URL) using mobile API
      const fetchProfile = async () => {
        try {
          const res: any = await api.getClientProfile();
          const profile = res?.profile;
          if (profile) {
            const imageUrl =
              profile.profileImageUrl || profile.profile_image || null;
            if (imageUrl) {
              setProfileImageUrl(imageUrl);
            }
          }
        } catch (error) {
          console.error("Failed to fetch client profile:", error);
        }
      };

      fetchProfile();
    }, []);

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData) {
        setUser(formData);
        localStorage.setItem("user", JSON.stringify(formData));
        toast.success("Profile updated successfully!");
        closeModal();
      }
    };

    const handleProfileImageChange = async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Basic validations as per docs
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload an image (jpeg, png, gif, webp).");
        return;
      }

      const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSizeBytes) {
        toast.error("File too large. Maximum size is 5 MB.");
        return;
      }

      try {
        setIsUploadingImage(true);
        const form = new FormData();
        form.append("profile_image", file);

        // Optionally include some basic fields if available
        if (user?.username) form.append("username", user.username);
        if (user?.email) form.append("email", user.email);

        const res: any = await api.updateClientProfile(form);

        const profile = res?.profile;
        const imageUrl =
          profile?.profileImageUrl || profile?.profile_image || null;

        if (imageUrl) {
          setProfileImageUrl(imageUrl);
        }

        toast.success("Profile picture updated successfully.");
      } catch (error: any) {
        console.error("Failed to upload profile image:", error);
        toast.error(
          error?.message || "Failed to upload profile picture. Please try again.",
        );
      } finally {
        setIsUploadingImage(false);
        // reset the file input so same file can be selected again if needed
        e.target.value = "";
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prevData) => {
        if (!prevData) return prevData;
        // Handle nested properties if needed
        return { ...prevData, [name]: value };
      });
    };

    if (!isDataLoaded || !user || !formData) {
      return (
        <div className="flex items-center justify-center p-8 min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <div className="text-gray-500 dark:text-gray-400 font-medium">Loading profile...</div>
          </div>
        </div>
      );
    }

    // Check if user is a student (case-insensitive)
    const isStudent = user?.role?.name?.toLowerCase() === "student";

    return (
      <div className="w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Profile Header with Gradient Background */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 sm:p-12">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-32 h-32 overflow-hidden border-4 border-white rounded-full shadow-2xl ring-4 ring-white/50">
                    {profileImageUrl ? (
                      <Image
                        width={128}
                        height={128}
                        src={profileImageUrl}
                        alt="user profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      (() => {
                        const initials = `${user.firstName?.[0] || "J"}${
                          user.lastName?.[0] || "D"
                        }`.toUpperCase();
                        return (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                            <span className="text-4xl font-bold text-white">{initials}</span>
                          </div>
                        );
                      })()
                    )}
                  </div>
                  {!isStudent && (
                    <label
                      className="absolute bottom-0 right-0 flex items-center justify-center w-10 h-10 rounded-full bg-white text-indigo-600 cursor-pointer shadow-lg hover:bg-indigo-50 hover:scale-110 transition-all duration-200"
                      title="Change profile picture"
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleProfileImageChange}
                        disabled={isUploadingImage}
                      />
                      {isUploadingImage ? (
                        <span className="animate-spin text-lg">⏳</span>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M4 3a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V8.414a2 2 0 00-.586-1.414l-3.414-3.414A2 2 0 0012.586 3H4zm6 3a4 4 0 110 8 4 4 0 010-8z" />
                        </svg>
                      )}
                    </label>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {user.firstName || "Jane"} {user.lastName || "Doe"}
                  </h4>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                      {user.role.name || "N/A"}
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {user.school.name || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
              {!isStudent && (
                <Button
                  onClick={openModal}
                  className="mt-6 sm:mt-0 px-6 py-3 text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-200 rounded-full shadow-xl font-semibold text-sm flex items-center justify-center hover:scale-105 hover:shadow-2xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-10 bg-white dark:bg-gray-800">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-6 shadow-lg border border-indigo-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h5 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Personal Information
                  </h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">First Name</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.firstName || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Last Name</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.lastName || "N/A"}</p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 break-all">{user.email || "N/A"}</p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Phone</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.phone || "N/A"}</p>
                  </div>
                  {user.bio && (
                    <div className="space-y-2 sm:col-span-2">
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Bio</p>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h5 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Address
                  </h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Country</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.country || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">City/State</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.cityState || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Postal Code</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.postalCode || "N/A"}</p>
                  </div>
                  {user.taxId && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">TAX ID</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.taxId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* School & Role Information Section */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 01.787 1.838L3.667 13.088l1.94.831a1 1 0 01.787 1.838l-7 3a1 1 0 01-.788 0l-7-3a1 1 0 000-1.838l7-3a1 1 0 01.788 0l4 1.714a1 1 0 11-.788 1.838L3.667 11.088l-1.94-.831a1 1 0 01-.787-1.838l7-3a1 1 0 01.788 0l4 1.714a1 1 0 11.788-1.838L10.333 6.912l-1.94-.831a1 1 0 01-.787-1.838l7-3z" />
                  </svg>
                </div>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white">
                  School & Role Information
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Role</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.role.name || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">School Name</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.school.name || "N/A"}</p>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">School Phone</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.school.phone || "N/A"}</p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">School Address</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.school.address || "N/A"}</p>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">School Email</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 break-all">{user.school.email || "N/A"}</p>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">School Website</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 break-all">{user.school.website || "N/A"}</p>
                </div>
                {user.role.description && (
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Role Description</p>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.role.description}</p>
                  </div>
                )}
                {user.school.description && (
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">School Description</p>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">{user.school.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Editing Profile */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl m-4">
          <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white">
                Edit Personal Information
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your details to keep your profile up-to-date.
              </p>
            </div>
            <form onSubmit={handleSave} className="flex flex-col mt-6">
              <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-6">
                {/* Personal Information Section in Modal */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="text"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</Label>
                      <Input
                        id="bio"
                        name="bio"
                        type="text"
                        value={formData.bio || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section in Modal */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Address
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cityState" className="text-sm font-medium text-gray-700 dark:text-gray-300">City/State</Label>
                      <Input
                        id="cityState"
                        name="cityState"
                        type="text"
                        value={formData.cityState || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={formData.postalCode || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxId" className="text-sm font-medium text-gray-700 dark:text-gray-300">TAX ID</Label>
                      <Input
                        id="taxId"
                        name="taxId"
                        type="text"
                        value={formData.taxId || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row-reverse items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button type="submit" size="sm" className="w-full sm:w-auto px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 rounded-full font-semibold text-sm">
                  Save Changes
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={closeModal} className="w-full sm:w-auto px-6 py-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-100 transition-colors duration-200 rounded-full dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
                  Close
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    );
  }
