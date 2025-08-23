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

  interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    bio?: string;
    country?: string;
    cityState?: string;
    postalCode?: string;
    taxId?: string;
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
    const router = useRouter();

    useEffect(() => {
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
        <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen  dark:bg-gray-900 font-sans p-4">
        <div className="w-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden px-4 sm:px-8">
          
          {/* Profile Header */}
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between">
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
      <div className="w-24 h-24 overflow-hidden border-4 border-indigo-500 dark:border-indigo-400 rounded-full shadow-lg">
        {(() => {
          const initials = `${user.firstName?.[0] || 'J'}${user.lastName?.[0] || 'D'}`.toUpperCase();
          return (
            <Image
              width={96}
              height={96}
              src={`https://placehold.co/96x96/6366F1/FFFFFF?text=${initials}`}
              alt="user profile"
              className="object-cover w-full h-full"
            />
          );
        })()}
      </div>
      <div className="text-center sm:text-left">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
          {user.firstName || "Jane"} {user.lastName || "Doe"}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {user.role.name || "N/A"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user.school.name || "N/A"}
        </p>
      </div>
    </div>
    <Button
      onClick={openModal}
      className="mt-6 sm:mt-0 px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 rounded-full shadow-md font-semibold text-sm flex items-center justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
      Edit Profile
    </Button>
  </div>

          {/* Profile Details Card */}
          <div className="p-6 sm:p-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information Section */}
              <div>
                <h5 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-indigo-200 dark:border-indigo-800">
                  Personal Information
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">First Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.lastName || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.phone || "N/A"}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bio</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.bio || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h5 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-indigo-200 dark:border-indigo-800">
                  Address
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Country</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.country || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">City/State</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.cityState || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Postal Code</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.postalCode || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">TAX ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.taxId || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            {/* School & Role Information Section */}
            <div>
              <h5 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-indigo-200 dark:border-indigo-800">
                School & Role Information
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.role.name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">School Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.school.name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">School Address</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.school.address || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">School Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.school.phone || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">School Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.school.email || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">School Website</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.school.website || "N/A"}</p>
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role Description</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.role.description || "N/A"}</p>
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">School Description</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.school.description || "N/A"}</p>
                </div>
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
