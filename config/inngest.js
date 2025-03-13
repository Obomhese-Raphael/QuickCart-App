import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest Functions to save user data to a database
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;
      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: first_name + " " + last_name,
        imageUrl: image_url,
      };
      await connectDB();
      await User.create(userData);
    } catch (error) {
      console.error("Error in syncUserCreation:", error);
      throw error; // Re-throw the error to mark the run as failed
    }
  }
);

// Inngest function to update user data in database
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;
      const userData = {
        email: email_addresses[0].email_address,
        name: first_name + " " + last_name,
        imageUrl: image_url,
      };
      await connectDB();
      await User.findByIdAndUpdate(id, userData, { new: true });
    } catch (error) {
      console.error("Error in syncUserUpdation:", error);
      throw error;
    }
  }
);

// Inngest function to delete user data from database
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
  },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;
      await connectDB();
      await User.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error in syncUserDeletion:", error);
      throw error;
    }
  }
);
